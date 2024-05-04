const table = document.querySelector("table tbody");
const tableBody = document.getElementById("employeeTableBody");
const paginationButtonsContainer = document.getElementById("paginationButtons");
const employeeFormContainer = document.getElementById("employeeFormContainer");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const employeeIdInput = document.getElementById("employeeId");
const employeeForm = document.getElementById("employeeForm");

const heading = document.getElementById("heading");
heading.innerHTML = `<span>${localStorage.getItem(
  "userName"
)}'s</span> Employees Dashboard`;

async function getEmployees(
  page = 1,
  department = "",
  sortBy = "date",
  sortOrder = "asc",
  searchName = ""
) {
  try {
    const url = new URL("https://all-backend-servers.onrender.com/employee");
    url.searchParams.append("page", page);
    if (department) url.searchParams.append("department", department);
    if (sortBy) url.searchParams.append("sortBy", sortBy);
    if (sortOrder) url.searchParams.append("sortOrder", sortOrder);
    if (searchName) url.searchParams.append("searchName", searchName);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const data = await response.json();
    console.log(data);
    renderEmployees(data.employees);
    createPaginationButtons(data.totalPages, page);
  } catch (err) {
    console.log(err);
  }
}

function renderEmployees(employees) {
  tableBody.innerHTML = "";
  employees.forEach((employee, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${index + 1}</td>
    <td>${employee.first_name}</td>
    <td>${employee.last_name}</td>
    <td>${employee.email}</td>
    <td>${employee.salary}</td>
    <td>${new Date(employee.date).toLocaleDateString()}</td>
    <td>${employee.department}</td>
    <td>
      <button onclick="openEditEmployeeForm('${employee._id}')">Edit</button>
      <button onclick="deleteEmployee('${employee._id}')">Delete</button>
    </td>
`;
    tableBody.appendChild(row);
  });
}

function createPaginationButtons(totalPages, currentPage) {
  paginationButtonsContainer.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    if (i === currentPage) {
      button.disabled = true;
      button.classList.add("active");
    }
    button.addEventListener("click", () => {
      getEmployees(i);
    });
    paginationButtonsContainer.appendChild(button);
  }
}

async function sortEmployees(sortBy) {
  const sortOrder = document.getElementById(
    `sort${sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}OrderSelect`
  ).value;
  getEmployees(1, "", sortBy, sortOrder);
}

async function filterEmployeesByDepartment() {
  const selectedDepartment = document.getElementById("departmentSelect").value;
  getEmployees(1, selectedDepartment);
}

async function openEmployeeForm() {
  employeeForm.reset();
  formTitle.textContent = "Add Employee";
  submitBtn.textContent = "Add Employee";
  employeeFormContainer.style.display = "block";
}

async function openEditEmployeeForm(employeeId) {
  try {
    const response = await fetch(
      `https://all-backend-servers.onrender.com/employee/${employeeId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    const data = await response.json();
    if (data && data.employee) {
      const employee = data.employee;
      console.log(employee);

      employeeIdInput.value = employee._id;
      document.getElementById("firstName").value = employee.first_name;
      document.getElementById("lastName").value = employee.last_name;
      document.getElementById("email").value = employee.email;
      document.getElementById("department").value = employee.department;
      document.getElementById("salary").value = employee.salary;

      formTitle.textContent = "Edit Employee";
      submitBtn.textContent = "Update Employee";

      employeeFormContainer.style.display = "block";

      employeeForm.onsubmit = async (event) => {
        event.preventDefault();
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const email = document.getElementById("email").value;
        const department = document.getElementById("department").value;
        const salary = document.getElementById("salary").value;
        const employeeId = document.getElementById("employeeId").value;

        try {
          const url = `https://all-backend-servers.onrender.com/employee/${employeeId}`;
          const body = JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email,
            department,
            salary,
          });
          const response = await fetch(url, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
            body,
          });
          const data = await response.json();
          if (data) {
            console.log("Employee updated successfully.");
            showToast("Employee updated successfully");
          }
          console.log(data);
          employeeFormContainer.style.display = "none";
          getEmployees();
        } catch (err) {
          console.error("Error updating employee:", err);
        }
      };
    } else {
      console.log("Employee not found.");
    }
  } catch (err) {
    console.error("Error fetching employee details:", err);
  }
}
function submitEmployeeForm(event) {
  event.preventDefault();
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const department = document.getElementById("department").value;
  const salary = document.getElementById("salary").value;

  const formData = {
    first_name: firstName,
    last_name: lastName,
    email: email,
    department: department,
    salary: salary,
  };

  addEmployee(formData);
}

async function addEmployee(formData) {
  try {
    const response = await fetch(
      "https://all-backend-servers.onrender.com/employee",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(formData),
      }
    );
    if (response.ok) {
      console.log("Employee added successfully.");

      document.getElementById("employeeForm").reset();
      document.getElementById("employeeFormContainer").style.display = "none";

      getEmployees();
      showToast("Employee created successfully");
    } else {
      console.error("Failed to add employee. Status:", response.status);
    }
  } catch (error) {
    console.error("Error adding employee:", error);
  }
}

async function deleteEmployee(employeeId) {
  try {
    const response = await fetch(
      `https://all-backend-servers.onrender.com/employee/${employeeId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    if (response.status === 200) {
      console.log("Employee deleted successfully.");
      getEmployees();
      showToast("Employee deleted successfully");
    } else {
      console.error("Failed to delete employee. Status:", response.status);
    }
  } catch (err) {
    console.error("Error deleting employee:", err);
  }
}

async function fetchEmployee(employeeId) {
  try {
    const response = await fetch(
      `https://all-backend-servers.onrender.com/employee/${employeeId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return await response.json();
  } catch (err) {
    console.error("Error fetching employee:", err);
    return null;
  }
}

async function logout() {
  try {
    const response = await fetch(
      "https://all-backend-servers.onrender.com/users/logout",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    const data = await response.json();
    console.log(data);
    localStorage.removeItem("token");
    window.location.href = "index.html";
  } catch (err) {
    console.log(err);
  }
}

function cancelEdit() {
  employeeFormContainer.style.display = "none";
}

getEmployees();

function showToast(message, type) {
  let toast;
  if (type === "edit") {
    toast = document.getElementById("editToast");
  } else {
    toast = document.getElementById("toast");
  }
  toast.classList.remove("hide");
  toast.innerText = message;
  setTimeout(() => {
    toast.classList.add("hide");
  }, 2000);
}
