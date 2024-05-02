const express = require("express");
require("dotenv").config();
const { EmployeeModel } = require("../model/employee.model");
const { auth } = require("../middleware/auth");

const employeeRouter = express.Router();

employeeRouter.post("/", auth, async (req, res) => {
    const { first_name, last_name, email, department, salary } = req.body;
    const userId = req.user._id;
    console.log(userId);
    try {
        const employee = new EmployeeModel({
            first_name,
            last_name,
            email,
            department,
            salary,
            user_id: userId,
        })
        await employee.save();
        res.status(201).send({ msg: "Employee created", employee });
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: "Error occurred while registering employee" });
    }
});


employeeRouter.get("/", auth, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;

    const department = req.query.department;
    const searchName = req.query.searchName;
    const sortBy = req.query.sortBy ;
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    const filter = { user_id: req.user._id };
    if (department) filter.department = department;
    if (searchName) filter.first_name = { $regex: searchName, $options: "i" };

    try {
        const count = await EmployeeModel.countDocuments(filter);
        const totalPages = Math.ceil(count / limit);

        const employees = await EmployeeModel.find(filter)
                                             .sort({ [sortBy]: sortOrder })
                                             .skip((page - 1) * limit)
                                             .limit(limit);

        res.status(200).send({ employees, totalPages, currentPage: page });
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: "Error occurred while fetching employees" });
    }
});


employeeRouter.patch("/:id",auth, async (req, res) => {
    try {
        const employee = await EmployeeModel.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).send({ msg: "employee updated", employee });
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: "error occured while updating employee" });
    }
});

employeeRouter.delete("/:id",auth, async (req, res) => {
    try {
        const employee = await EmployeeModel.findByIdAndDelete(req.params.id);
        res.status(200).send({ msg: "employee deleted", employee });
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: "error occured while deleting employee" });
    }
});

module.exports = {
    employeeRouter,
};
