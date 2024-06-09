// routes/employee.route.js
const express = require("express");
require("dotenv").config();
const { EmployeeModel } = require("../model/employee.model");
const { auth } = require("../middleware/auth");

const employeeRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - email
 *         - department
 *         - salary
 *       properties:
 *         first_name:
 *           type: string
 *           description: The first name of the employee
 *         last_name:
 *           type: string
 *           description: The last name of the employee
 *         email:
 *           type: string
 *           description: The email of the employee
 *         department:
 *           type: string
 *           description: The department where the employee works
 *         salary:
 *           type: number
 *           description: The salary of the employee
 *       example:
 *         first_name: John
 *         last_name: Doe
 *         email: john.doe@example.com
 *         department: Engineering
 *         salary: 60000
 */

/**
 * @swagger
 * /employee:
 *   post:
 *     summary: Creates a new employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Error occurred while registering employee
 */
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

/**
 * @swagger
 * /employee:
 *   get:
 *     summary: Gets a list of employees with pagination, sorting, and filtering
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: The department to filter employees by
 *       - in: query
 *         name: searchName
 *         schema:
 *           type: string
 *         description: The first name to search employees by
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [first_name, last_name, email, department, salary]
 *           default: first_name
 *         description: The field to sort employees by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: The sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: A list of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 employees:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *                 totalPages:
 *                   type: integer
 *                   description: The total number of pages
 *                 currentPage:
 *                   type: integer
 *                   description: The current page number
 *       400:
 *         description: Error occurred while fetching employees
 */
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

/**
 * @swagger
 * /employee/{id}:
 *   get:
 *     summary: Gets the details of a specific employee by ID
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the employee to retrieve
 *     responses:
 *       200:
 *         description: Employee fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "employee fetched"
 *                 employee:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Error occurred while fetching employee
 */
employeeRouter.get("/:id", auth, async (req, res) => {
    try {
        const employee = await EmployeeModel.findById(req.params.id);
        res.status(200).send({ msg: "employee fetched", employee });
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: "Error occurred while fetching employee" });
    }
})

/**
 * @swagger
 * /employee/{id}:
 *   patch:
 *     summary: Updates the details of a specific employee by ID
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the employee to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "employee updated"
 *                 employee:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Error occurred while updating employee
 */
employeeRouter.patch("/:id", auth, async (req, res) => {
    try {
        const employee = await EmployeeModel.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).send({ msg: "employee updated", employee });
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: "error occured while updating employee" });
    }
});

/**
 * @swagger
 * /employee/{id}:
 *   delete:
 *     summary: Deletes a specific employee by ID
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the employee to delete
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "employee deleted"
 *                 employee:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Error occurred while deleting employee
 */
employeeRouter.delete("/:id", auth, async (req, res) => {
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
