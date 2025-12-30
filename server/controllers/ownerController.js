import User from '../models/User.js';
import fs from 'fs';
import imagekit from '../configs/imageKit.js';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';

// API to change Role of User

export const changeRoleToOwner = async (req, res) => {

    try{
        const {_id} = req.user;

        await User.findByIdAndUpdate(_id, { role: 'owner' });
        res.json({
            success: true,
            message: "Now you can list cars."
        });
    }

    catch(error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

//API to List Car

export const addCar = async (req, res) => {

    try{
        const {_id} = req.user;
        let car;
        
        try {
            car = JSON.parse(req.body.carData);
        } catch (error) {
            console.log("Error parsing car data:", error.message);
            return res.json({
                success: false,
                message: "Invalid car data format"
            });
        }
        
        if (!req.file) {
            return res.json({
                success: false,
                message: "Car image is required"
            });
        }
        
        const imageFile = req.file;

        // Upload Image to Imagekit
        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars',
        });

        // optimization through imagekit URL transformation
        var optimizedImageUrl = imagekit.url({
            path : response.filePath,
            transformation : [
                {width: '1280'},     //width resizing
                {quality: 'auto'},   //Auto compression
                {format: 'webp'}     // Convert to modern format  
            ]
        });

        const image = optimizedImageUrl;
        
        // Ensure all required fields are present
        const requiredFields = ['brand', 'model', 'year', 'category', 'seating_capacity', 
                               'fuel_type', 'transmission', 'pricePerDay', 'location', 'description'];
        
        for (const field of requiredFields) {
            if (!car[field]) {
                return res.json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }
        
        // Create the car with explicit field mapping to ensure data integrity
        const newCar = await Car.create({
            owner: _id,
            brand: car.brand,
            model: car.model,
            image: image,
            year: car.year,
            category: car.category,
            seating_capacity: car.seating_capacity,
            fuel_type: car.fuel_type,
            transmission: car.transmission,
            pricePerDay: car.pricePerDay,
            location: car.location,
            description: car.description,
            isAvailable: true
        });
        
        console.log("Car created successfully:", newCar._id);

        res.json({
            success: true,
            message: "Car Added.",
            carId: newCar._id
        });

}

    catch(error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// API to List Owner Cars

export const getOwnerCars = async (req, res) => {

    try{
        const {_id} = req.user;
        const cars = await Car.find({ owner: _id });

        res.json({ 
            success: true,
            cars
        });
    }
    
    catch(error) {
        console.log(error.message);
        res.json({success: false, message: error.message}); 
    }

}

//API to Toggle Car Availability

export const toggleCarAvailability = async (req, res) => {

    try{
        const {_id} = req.user;
        const { carId } = req.body;
        const car = await Car.findById(carId);

        //Checking is car belongs to the user

        if(car.owner.toString() !== _id.toString()) {
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }

        car.isAvailable = !car.isAvailable;
        await car.save();

        res.json({
            success: true,
            message: "Availability Toggled."
        });

    }

    catch(error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Api to delete a car

export const deleteCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);

    if (!car) {
      return res.json({ success: false, message: "Car not found" });
    }

    if (car.owner.toString() !== _id.toString()) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Hard delete
    await Car.findByIdAndDelete(carId);

    res.json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to get Dashboard Data

export const getDashboardData = async (req, res) => {

    try{
        const {_id, role} = req.user;

        if(role !== 'owner') {
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }

        const cars = await Car.find({ owner: _id });
        const booking = await Booking.find({ owner: _id }).populate('car').sort({ createdAt: -1 });

        const pendingBookings = await Booking.find({ owner: _id, status: 'pending' });
        const completedBookings = await Booking.find({ owner: _id, status: 'confirmed' });

        // Calculate monthlyRevenue from bookings where status is confirmed

        const monthlyRevenue = booking.slice().filter(booking => booking.status === 'confirmed').reduce((acc, booking)=> acc + booking.price, 0);

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: booking.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: booking.slice(0, 3),
            monthlyRevenue
        }

        res.json({
            success: true,
            dashboardData
        });

    }

    catch(error) {  
        console.log(error.message);
        res.json({success: false, message: error.message});
    }

}

// API to update user image

export const updateUserImage = async (req, res) => {

    try{
        const {_id} = req.user;
         const imageFile = req.file;

        // Upload Image to Imagekit
        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users',
        });

        // optimization through imagekit URL transformation

        // For URL Generation, works for both images and videos
        var optimizedImageUrl = imagekit.url({
            path : response.filePath,
            transformation : [
                {width: '400'},     //width resizing
                {quality: 'auto'},   //Auto compression
                {format: 'webp'}     // Convert to modern format  
            ]
        });

        const image = optimizedImageUrl;
        await User.findByIdAndUpdate(_id, { image });

        res.json({
            success: true,
            message: "Image Updated",
            image
        });

    }

    catch(error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }

}
