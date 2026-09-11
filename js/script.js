/* Backend API */

const API_BASE_URL =
    "https://must-serviceconnect-backend.onrender.com";

const browserFetch =
    window.fetch.bind(window);

window.fetch = function (resource, options) {

    if (
        typeof resource === "string" &&
        resource.startsWith("/api/")
    ) {
        resource =
            API_BASE_URL + resource;
    }

    return browserFetch(resource, options);
};


/* Services Page */


/* Services Container */

const servicesContainer =
    document.getElementById("services-container");


const serviceSearch =
    document.getElementById("service-search");


/* Store Loaded Services */

let allServices = [];


/* Services API */

const SERVICES_API =
    "/api/services";


/* Load Services */

async function loadServices() {

    if (!servicesContainer) {
        return;
    }


    try {

        servicesContainer.innerHTML = `
            <p style="text-align: center;">
                Loading services...
            </p>
        `;


        const response =
            await fetch(SERVICES_API);


        if (!response.ok) {

            throw new Error(
                "Failed to load services."
            );

        }


        const services =
            await response.json();


        allServices =
            Array.isArray(services)
                ? services
                : [];


        renderServices(
            allServices
        );


    } catch (error) {

        console.error(
            "Error loading services:",
            error
        );


        servicesContainer.innerHTML = `
            <p style="text-align: center;">
                Unable to load service data.
            </p>
        `;

    }

}


/* Render Services */

function renderServices(services) {

    if (!servicesContainer) {
        return;
    }


    servicesContainer.innerHTML = "";


    if (
        !services ||
        services.length === 0
    ) {

        servicesContainer.innerHTML = `
            <p style="text-align: center;">
                No service data available.
            </p>
        `;

        return;

    }


    /* Group Services By Category */

    const categories = {};


    services.forEach(function (service) {

        const categoryName =
            service.category_name ||
            service.category ||
            "Other Services";


        if (!categories[categoryName]) {

            categories[categoryName] = [];

        }


        categories[categoryName].push(
            service
        );

    });


    /* Create Category Sections */

    Object.keys(categories).forEach(
        function (categoryName) {

            const categorySection =
                document.createElement("section");


            categorySection.className =
                "service-category";


            const heading =
                document.createElement("h3");


            heading.textContent =
                categoryName;


            categorySection.appendChild(
                heading
            );


            /* Table Container */

            const tableContainer =
                document.createElement("div");


            tableContainer.className =
                "table-container";


            /* Table */

            const table =
                document.createElement("table");


            table.className =
                "service-table";


            /* Table Header */

            table.innerHTML = `

                <thead>

                    <tr>

                        <th>Service Name</th>

                        <th>Special Name</th>

                        <th>Location</th>

                        <th>Status</th>

                        <th>Availability</th>

                        <th>Actions</th>

                    </tr>

                </thead>


                <tbody></tbody>

            `;


            const tbody =
                table.querySelector("tbody");


            /* Services */

            categories[
                categoryName
            ].forEach(function (service) {

                const row =
                    createServiceRow(
                        service
                    );


                tbody.appendChild(row);

            });


            tableContainer.appendChild(
                table
            );


            categorySection.appendChild(
                tableContainer
            );


            servicesContainer.appendChild(
                categorySection
            );

        }
    );

}


/* Create Service Row */

function createServiceRow(service) {

    const row =
        document.createElement("tr");


    row.innerHTML = `

        <td>
            ${escapeHtml(
                service.name || "-"
            )}
        </td>


        <td>
            ${escapeHtml(
                service.special_name ||
                service.specialName ||
                "-"
            )}
        </td>


        <td>
            ${escapeHtml(
                service.location || "-"
            )}
        </td>


        <td>

            <span class="dashboard-status
                ${getServiceStatusClass(
                    service.status
                )}">

                ${escapeHtml(
                    service.status ||
                    "unknown"
                )}

            </span>

        </td>


        <td>
            ${escapeHtml(
                service.availability ||
                service.status ||
                "-"
            )}
        </td>


        <td>

            <button
                type="button"
                class="action-btn"
                onclick='openServiceDetailsModal(${JSON.stringify(service)})'>

                View Details

            </button>

        </td>

    `;


    return row;

}


/* Service Status Class */

function getServiceStatusClass(status) {

    switch (
        String(status || "").toLowerCase()
    ) {

        case "available":
            return "available";

        case "busy":
            return "busy";

        case "away":
            return "away";

        case "closed":
            return "closed";

        default:
            return "pending";

    }

}


/* Search Services */

if (serviceSearch) {

    serviceSearch.addEventListener(
        "input",
        function () {

            const searchValue =
                this.value
                    .trim()
                    .toLowerCase();


            if (!searchValue) {

                renderServices(
                    allServices
                );

                return;

            }


            const filteredServices =
                allServices.filter(
                    function (service) {

                        const serviceText = [

                            service.name,

                            service.special_name,

                            service.specialName,

                            service.location,

                            service.status,

                            service.availability,

                            service.category_name,

                            service.category,

                            service.description

                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                        return serviceText.includes(
                            searchValue
                        );

                    }
                );


            renderServices(
                filteredServices
            );

        }
    );

}


/* View Service Details */

function openServiceDetailsModal(service) {

    openCrudModal({

        title: "Service Details",

        confirmText: "Close",

        fields: `

            <div class="service-details">

                <p>
                    <strong>Service Name:</strong>
                    ${escapeHtml(
                        service.name || "-"
                    )}
                </p>


                <p>
                    <strong>Category:</strong>
                    ${escapeHtml(
                        service.category_name ||
                        service.category ||
                        "-"
                    )}
                </p>


                <p>
                    <strong>Special Name:</strong>
                    ${escapeHtml(
                        service.special_name ||
                        service.specialName ||
                        "-"
                    )}
                </p>


                <p>
                    <strong>Location:</strong>
                    ${escapeHtml(
                        service.location || "-"
                    )}
                </p>


                <p>
                    <strong>Status:</strong>
                    ${escapeHtml(
                        service.status || "-"
                    )}
                </p>


                <p>
                    <strong>Availability:</strong>
                    ${escapeHtml(
                        service.availability ||
                        service.status ||
                        "-"
                    )}
                </p>


                <p>
                    <strong>Description:</strong>
                    ${escapeHtml(
                        service.description || "-"
                    )}
                </p>

                <p>
                    <strong>Working Hours:</strong>
                    ${escapeHtml(
                        service.working_hours || "-"
                    )}
                </p>

            </div>

        `

    });


}


/* Escape HTML */

function escapeHtml(value) {

    const div =
        document.createElement("div");


    div.textContent =
        String(value ?? "");


    return div.innerHTML;

}


/* Load Services When Page Opens */

loadServices();

/* Home Page - Live Service Status */

const liveServiceStatus =
    document.getElementById("live-service-status");


/* Load Live Service Status */

async function loadLiveServiceStatus() {

    if (!liveServiceStatus) {
        return;
    }


    try {

        liveServiceStatus.innerHTML = `
            <p style="text-align: center;">
                Loading service status...
            </p>
        `;


        const response =
            await fetch("/api/services");


        if (!response.ok) {

            throw new Error(
                "Failed to load service status."
            );

        }


        const services =
            await response.json();


        renderLiveServiceStatus(
            services
        );


    } catch (error) {

        console.error(
            "Error loading live service status:",
            error
        );


        liveServiceStatus.innerHTML = `
            <p style="text-align: center;">
                Unable to load service status.
            </p>
        `;

    }

}


/* Render Live Service Status */

function renderLiveServiceStatus(services) {

    if (!liveServiceStatus) {
        return;
    }


    liveServiceStatus.innerHTML = "";


    if (
        !services ||
        services.length === 0
    ) {

        liveServiceStatus.innerHTML = `
            <p style="text-align: center;">
                No service data available.
            </p>
        `;

        return;

    }


    services.forEach(function (service) {

        const statusCard =
            document.createElement("div");


        statusCard.className =
            "status-card";


        statusCard.innerHTML = `

            <h3>
                ${escapeHtml(
                    service.name || "-"
                )}
            </h3>


            <p class="${getServiceStatusClass(
                service.status
            )}">

                ${getServiceStatusIcon(
                    service.status
                )}

                ${escapeHtml(
                    service.status ||
                    "Unknown"
                )}

            </p>


            <p>

                Location:
                ${escapeHtml(
                    service.location || "-"
                )}

            </p>

        `;


        liveServiceStatus.appendChild(
            statusCard
        );

    });

}


/* Status Icon */

function getServiceStatusIcon(status) {

    switch (
        String(status || "").toLowerCase()
    ) {

        case "available":
            return "🟢";

        case "busy":
            return "🟡";

        case "closed":
            return "🔴";

        case "away":
            return "🟠";

        default:
            return "⚪";

    }

}


/* Load Home Page Status */

loadLiveServiceStatus();


/* Appointment Service Selection */


/* Appointment Form Elements */

const appointmentCategory =
    document.getElementById("service-category");

const appointmentService =
    document.getElementById("service");

const appointmentProvider =
    document.getElementById("service-provider");


/* Store Appointment Services */

let appointmentServices = [];


/* Load Service Categories */

async function loadAppointmentCategories() {

    if (!appointmentCategory) {
        return;
    }


    try {

        const response =
            await fetch("/api/service-categories");


        if (!response.ok) {

            throw new Error(
                "Failed to load service categories."
            );

        }


        const categories =
            await response.json();


        appointmentCategory.innerHTML = `
            <option value="">
                Select service category
            </option>
        `;


        categories
            .filter(function (category) {
                return category.is_active !== false;
            })
            .forEach(
            function (category) {

                const option =
                    document.createElement("option");


                option.value =
                    category.id;


                option.textContent =
                    category.name;


                appointmentCategory.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Error loading service categories:",
            error
        );


        appointmentCategory.innerHTML = `
            <option value="">
                Unable to load categories
            </option>
        `;

    }

}
/* Load Providers */

const assignmentProviderSelect =
    document.getElementById(
        "assignment-provider"
    );


if (assignmentProviderSelect) {

    const token =
        localStorage.getItem("token");

    if (!token) {

        assignmentProviderSelect.innerHTML = `
            <option value="">
                Please login first
            </option>
        `;

    } else {

        fetch(
            "/api/providers",
            {
                method: "GET",

                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        )
            .then(function (response) {

                if (!response.ok) {

                    throw new Error(
                        "Failed to load providers."
                    );
                }

                return response.json();

            })
            .then(function (providers) {

                assignmentProviderSelect.innerHTML = `
                    <option value="">
                        Select provider
                    </option>
                `;

                providers.forEach(
                    function (provider) {

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value =
                            provider.id;

                        option.textContent =
                            provider.full_name ||
                            provider.provider_name ||
                            provider.name;

                        assignmentProviderSelect.appendChild(
                            option
                        );

                    }
                );

            })
            .catch(function (error) {

                console.error(
                    "Provider loading error:",
                    error
                );

                assignmentProviderSelect.innerHTML = `
                    <option value="">
                        Unable to load providers
                    </option>
                `;

            });

    }

}

/* Load Services */

const assignmentServiceSelect =
    document.getElementById(
        "assignment-service"
    );


if (assignmentServiceSelect) {

    const token =
        localStorage.getItem("token");

    if (!token) {

        assignmentServiceSelect.innerHTML = `
            <option value="">
                Please login first
            </option>
        `;

    } else {

        fetch(
            "/api/services",
            {
                method: "GET",

                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        )
            .then(function (response) {

                if (!response.ok) {

                    throw new Error(
                        "Failed to load services."
                    );
                }

                return response.json();

            })
            .then(function (services) {

                assignmentServiceSelect.innerHTML = `
                    <option value="">
                        Select service
                    </option>
                `;

                services.forEach(
                    function (service) {

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value =
                            service.id;

                        option.textContent =
                            service.name;

                        assignmentServiceSelect.appendChild(
                            option
                        );

                    }
                );

            })
            .catch(function (error) {

                console.error(
                    "Service loading error:",
                    error
                );

                assignmentServiceSelect.innerHTML = `
                    <option value="">
                        Unable to load services
                    </option>
                `;

            });

    }

}


/* Load Services */

async function loadAppointmentServices() {

    if (!appointmentService) {
        return;
    }


    const categoryId =
        appointmentCategory
            ? appointmentCategory.value
            : "";


    appointmentService.innerHTML = `
        <option value="">
            Loading services...
        </option>
    `;


    if (!categoryId) {

        appointmentService.innerHTML = `
            <option value="">
                Select a category first
            </option>
        `;

        return;

    }


    try {

        const response =
            await fetch(
                "/api/services?category_id=" +
                encodeURIComponent(categoryId)
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load services."
            );

        }


        const services =
            await response.json();


        appointmentServices =
            Array.isArray(services)
                ? services
                : [];


        appointmentService.innerHTML = `
            <option value="">
                Select service
            </option>
        `;


        if (
            appointmentServices.length === 0
        ) {

            appointmentService.innerHTML = `
                <option value="">
                    No services available
                </option>
            `;

            return;

        }


        appointmentServices.forEach(
            function (service) {

                const option =
                    document.createElement("option");


                option.value =
                    service.id;


                option.textContent =
                    service.name;


                appointmentService.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Error loading services:",
            error
        );


        appointmentService.innerHTML = `
            <option value="">
                Unable to load services
            </option>
        `;

    }

}


/* Load Service Providers */

async function loadAppointmentProviders() {

    if (!appointmentProvider) {
        return;
    }


    const serviceId =
        appointmentService
            ? appointmentService.value
            : "";


    appointmentProvider.innerHTML = `
        <option value="">
            Loading service providers...
        </option>
    `;


    if (!serviceId) {

        appointmentProvider.innerHTML = `
            <option value="">
                Select a service first
            </option>
        `;

        return;

    }


    try {

        const response =
            await fetch(
                "/api/providers/available/" +
                encodeURIComponent(serviceId)
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load service providers."
            );

        }


        const providers =
            await response.json();


        appointmentProvider.innerHTML = `
            <option value="">
                Select person or office
            </option>
        `;


        if (
            !providers ||
            providers.length === 0
        ) {

            appointmentProvider.innerHTML = `
                <option value="">
                    No provider available
                </option>
            `;

            return;

        }


        providers.forEach(
            function (provider) {

                const option =
                    document.createElement("option");


                option.value =
                    provider.id;


                option.textContent =
                    provider.full_name ||
                    provider.provider_name ||
                    provider.name;


                appointmentProvider.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Error loading providers:",
            error
        );


        appointmentProvider.innerHTML = `
            <option value="">
                Unable to load providers
            </option>
        `;

    }

}


/* Category Changed */

if (appointmentCategory) {

    appointmentCategory.addEventListener(
        "change",
        loadAppointmentServices
    );

}


/* Service Changed */

if (appointmentService) {

    appointmentService.addEventListener(
        "change",
        loadAppointmentProviders
    );

}


/* Load Categories When Page Opens */

loadAppointmentCategories();


/* Signup - User Role */

const signupRole =
    document.getElementById("user-role");

const providerFields =
    document.getElementById("provider-fields");

const providerId =
    document.getElementById("provider-id");

const signupServiceCategory =
    document.getElementById("service-category");

const signupService = 
    document.getElementById("service");


if (signupRole && providerFields) {

    signupRole.addEventListener(
        "change",
        function () {

            const selectedRole =
                this.value;

            if (selectedRole === "provider") {

                providerFields.style.display =
                    "block";

                if (providerId) {
                    providerId.required = true;
                }

                if (signupServiceCategory) {
                    signupServiceCategory.required = true;
                }

                if (signupService) {
                    signupService.required = true;
                }

            } else {

                providerFields.style.display =
                    "none";

                if (providerId) {
                    providerId.required = false;
                    providerId.value = "";
                }

                if (signupServiceCategory) {
                    signupServiceCategory.required = false;
                    signupServiceCategory.value = "";
                }

                if (signupService) {

    signupService.required = false;

    signupService.innerHTML = `
        <option value=""> 
            Select a category first 
        </option> 
    `;

}

            }

        }
    );

}

/* Appointment Form */

const appointmentForm =
    document.getElementById("appointment-form");

const appointmentDate =
    document.getElementById("appointment-date");

if (appointmentDate) {
    appointmentDate.min = new Date()
        .toISOString()
        .split("T")[0];
}

/* Appointment Submission */

const appointmentMessage =
    document.getElementById("appointment-message");

if (appointmentForm && appointmentMessage) {

    appointmentForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {

            appointmentMessage.innerHTML = `
                <p>
                    <strong>Please login first to book an appointment.</strong>
                </p>
            `;

            appointmentMessage.style.display = "block";

            return;
        }

        const formData = new FormData(appointmentForm);

        const appointmentData = {
            full_name: formData.get("fullname"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            service_id: Number(formData.get("service")),
            provider_id: Number(formData.get("service-provider")),
            reason: formData.get("reason"),
            appointment_date: formData.get("appointment_date")
        };

        try {

            const response = await fetch(
                "/api/appointments",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },

                    body: JSON.stringify(appointmentData)
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to submit appointment."
                );

            }

            appointmentMessage.innerHTML = `
                <p>
                    <strong>
                        Appointment request submitted successfully.
                    </strong>
                </p>

                <p>
                    Your appointment has been assigned for
                    <strong>${data.appointment.appointment_date}</strong>
                    at
                    <strong>${data.appointment.appointment_time}</strong>.
                </p>

                <p>
                    Please arrive on time and maintain a neat,
                    clean and respectful appearance.
                </p>
            `;

            appointmentMessage.style.display = "block";

            appointmentForm.reset();

            appointmentService.innerHTML = `
                <option value="">
                    Select a service
                </option>
            `;

            appointmentProvider.innerHTML = `
                <option value="">
                    Select a service first
                </option>
            `;

        } catch (error) {

            console.error(
                "Appointment submission error:",
                error
            );

            appointmentMessage.innerHTML = `
                <p>
                    <strong>
                        Unable to submit appointment.
                    </strong>
                </p>

                <p>
                    ${error.message}
                </p>
            `;

            appointmentMessage.style.display = "block";
        }

    });

}

/*REUSABLE CRUD MODAL*/

const crudModal = document.getElementById("crud-modal");
const modalTitle = document.getElementById("modal-title");
const modalFields = document.getElementById("modal-fields");
const modalForm = document.getElementById("modal-form");
const modalClose = document.getElementById("modal-close");
const modalCancel = document.getElementById("modal-cancel");
const modalConfirm = document.getElementById("modal-confirm");
const modalMessage = document.getElementById("modal-message");

let currentCrudAction = null;

function openCrudModal(options = {}) {

    if (!crudModal) {
        return;
    }

    currentCrudAction = options.action || null;

    modalTitle.textContent = options.title || "Action";

    modalFields.innerHTML = options.fields || "";

    modalConfirm.textContent =
        options.confirmText || "Confirm";

    modalConfirm.className =
        "modal-btn " +
        (options.danger
            ? "modal-btn-danger"
            : "modal-btn-confirm");

    modalConfirm.style.display =
        options.hideConfirm ? "none" : "inline-flex";

    modalMessage.style.display = "none";
    modalMessage.textContent = "";

    crudModal.classList.add("active");

    const firstInput =
        modalFields.querySelector(
            "input, select, textarea"
        );

    if (firstInput) {
        setTimeout(function () {
            firstInput.focus();
        }, 100);
    }
}


function closeCrudModal() {

    if (!crudModal) {
        return;
    }

    crudModal.classList.remove("active");

    if (modalForm) {
        modalForm.reset();
    }

    if (modalFields) {
        modalFields.innerHTML = "";
    }

    if (modalConfirm) {
        modalConfirm.style.display = "inline-flex";
    }

    if (modalMessage) {
        modalMessage.style.display = "none";
        modalMessage.textContent = "";
    }

    currentCrudAction = null;

}


if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeCrudModal
    );

}


if (modalCancel) {

    modalCancel.addEventListener(
        "click",
        closeCrudModal
    );

}


if (crudModal) {

    crudModal.addEventListener(
        "click",
        function (event) {

            if (event.target === crudModal) {
                closeCrudModal();
            }

        }
    );

}


if (modalForm) {

    modalForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            if (!currentCrudAction) {
                closeCrudModal();
                return;
            }

            const formData =
                new FormData(modalForm);

            const token =
                localStorage.getItem("token");

            if (!token) {

                modalMessage.textContent =
                    "Please login first.";

                modalMessage.style.display =
                    "block";

                return;
            }

            try {

                let response;

                /* Create User */

                if (
                    currentCrudAction ===
                    "create-user"
                ) {

                    const userId = String(
                        formData.get("user_id") || ""
                    ).trim();

                    if (!/^\d{14}$/.test(userId)) {
                        throw new Error(
                            "User ID must contain exactly 14 digits."
                        );
                    }

                    response = await fetch(
                        "/api/users",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer " + token
                            },
                            body: JSON.stringify({
                                user_id: userId,
                                full_name: formData.get("full_name"),
                                email: formData.get("email"),
                                phone: formData.get("phone"),
                                password: formData.get("password"),
                                role: formData.get("role")
                            })
                        }
                    );
                }

                /* Create Category */

                else if (
                    currentCrudAction ===
                    "create-category"
                ) {

                    response =
                        await fetch(
                            "/api/service-categories",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        "Bearer " + token
                                },

                                body: JSON.stringify({
                                    name:
                                        formData.get("name"),

                                    description:
                                        formData.get(
                                            "description"
                                        )
                                })
                            }
                        );
                }

                /* Edit Category */

                else if (
                    currentCrudAction ===
                    "edit-category"
                ) {

                    const categoryId =
                        formData.get(
                            "category_id"
                        );

                    response =
                        await fetch(
                            "/api/service-categories/" +
                            categoryId,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        "Bearer " + token
                                },

                                body: JSON.stringify({
                                    name:
                                        formData.get("name"),

                                    description:
                                        formData.get(
                                            "description"
                                        ),

                                    is_active:
                                        formData.get(
                                            "status"
                                        ) === "active"
                                })
                            }
                        );
                }

                /* Delete Category */

                else if (
                    currentCrudAction ===
                    "delete-category"
                ) {

                    const categoryId =
                        formData.get(
                            "category_id"
                        );

                    response =
                        await fetch(
                            "/api/service-categories/" +
                            categoryId,
                            {
                                method: "DELETE",

                                headers: {
                                    "Authorization":
                                        "Bearer " + token
                                }
                            }
                        );
                }

                    /* Edit User */

                    else if (
                        currentCrudAction ===
                        "edit-user"
                    ) {

                        const userId =
                            formData.get("id");

                        response = await fetch(
                            "/api/users/" + userId,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        "Bearer " + token
                                },

                                body: JSON.stringify({
                                    user_id:
                                        formData.get("user_id"),
                                    full_name:
                                        formData.get("full_name"),
                                    email:
                                        formData.get("email"),
                                    phone:
                                        formData.get("phone"),
                                    role:
                                        formData.get("role"),
                                    is_active:
                                        formData.get("status") === "active"
                                })
                            }
                        );
                    }

                    /* Deactivate User */

                    else if (
                        currentCrudAction ===
                        "delete-user"
                    ) {

                        const userId =
                            formData.get("id");

                        response = await fetch(
                            "/api/users/" + userId,
                            {
                                method: "DELETE",

                                headers: {
                                    "Authorization":
                                        "Bearer " + token
                                }
                            }
                        );
                    }
                
                        /* Cancel Student Appointment */

        else if (
            currentCrudAction ===
            "cancel-student-appointment"
        ) {

            const appointmentId =
                formData.get(
                    "appointment_id"
                );

            if (!appointmentId) {

                throw new Error(
                    "Appointment ID is required."
                );
            }

            response =
                await fetch(
                    "/api/appointments/" +
                    appointmentId +
                    "/cancel",
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token
                        },

                        body: JSON.stringify({
                            reason:
                                formData.get(
                                    "cancellation_reason"
                                ) || null
                        })
                    }
                );
        }
                  
        
                /* Approve Appointment */

        else if (
            currentCrudAction ===
            "approve-appointment"
        ) {

            const appointmentId =
                formData.get(
                    "appointment_id"
                );

            if (!appointmentId) {

                throw new Error(
                    "Appointment ID is required."
                );
            }

            response =
                await fetch(
                    "/api/appointments/" +
                    appointmentId +
                    "/status",
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token
                        },

                        body: JSON.stringify({
                            status: "approved"
                        })
                    }
                );
        }

                /* Reject Appointment */

        else if (
            currentCrudAction ===
            "reject-appointment"
        ) {

            const appointmentId =
                formData.get(
                    "appointment_id"
                );

            const rejectionReason =
                formData.get(
                    "rejection_reason"
                );

            if (!appointmentId) {

                throw new Error(
                    "Appointment ID is required."
                );
            }

            if (!rejectionReason) {

                throw new Error(
                    "Rejection reason is required."
                );
            }

            response =
                await fetch(
                    "/api/appointments/" +
                    appointmentId +
                    "/status",
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token
                        },

                        body: JSON.stringify({

                            status: "rejected",

                            rejection_reason:
                                rejectionReason

                        })
                    }
                );
        }

        /* Complete Appointment */

        else if (
            currentCrudAction ===
            "complete-appointment"
        ) {

            const appointmentId =
                formData.get(
                    "appointment_id"
                );

            if (!appointmentId) {

                throw new Error(
                    "Appointment ID is required."
                );
            }

            response =
                await fetch(
                    "/api/appointments/" +
                    appointmentId +
                    "/status",
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token
                        },

                        body: JSON.stringify({
                            status: "completed"
                        })
                    }
                );
        }

                /* Cancel Officer Appointment */

        else if (
            currentCrudAction ===
            "cancel-officer-appointment"
        ) {

            const appointmentId =
                formData.get(
                    "appointment_id"
                );

            if (!appointmentId) {

                throw new Error(
                    "Appointment ID is required."
                );
            }

            response =
                await fetch(
                    "/api/appointments/" +
                    appointmentId +
                    "/cancel",
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token
                        }
                    }
                );
        }

/* Update Provider Appointment Status */

else if (
    currentCrudAction ===
    "update-provider-appointment-status"
) {

    const appointmentId =
        formData.get(
            "appointment_id"
        );

    const selectedStatus =
        formData.get(
            "status"
        );

    if (!appointmentId || !selectedStatus) {

        throw new Error(
            "Appointment ID and status are required."
        );
    }

    response =
        await fetch(
            "/api/appointments/" +
            appointmentId +
            "/status",
            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({
                    status:
                        selectedStatus,

                    rejection_reason:
                        formData.get("rejection_reason") || null
                })
            }
        );
} 

                        /* Edit Student Appointment */

        else if (
            currentCrudAction ===
            "edit-student-appointment"
        ) {

            const appointmentId =
                formData.get(
                    "appointment_id"
                );

            if (!appointmentId) {

                throw new Error(
                    "Appointment ID is required."
                );
            }

            response =
                await fetch(
                    "/api/appointments/" +
                    appointmentId,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token
                        },

                        body: JSON.stringify({

                            reason:
                                formData.get(
                                    "reason"
                                ),

                            appointment_date:
                                formData.get(
                                    "appointment_date"
                                )

                        })
                    }
                );
        }

                /* Create Service */

else if (
    currentCrudAction ===
    "create-service"
) {

    const serviceName =
        formData.get(
            "service_name"
        );

    const categoryId =
        formData.get(
            "category_id"
        );

    const location =
        formData.get(
            "location"
        );

    const status =
        formData.get(
            "status"
        );

    const workingHours =
        formData.get(
            "working_hours"
        );


    if (
        !serviceName ||
        !categoryId ||
        !location ||
        !status ||
        !workingHours
    ) {

        throw new Error(
            "Please fill in all service fields."
        );
    }


    response =
        await fetch(
            "/api/services",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({

                    name:
                        serviceName,

                    category_id:
                        Number(categoryId),

                    location:
                        location,

                    status:
                        status,

                    working_hours:
                        workingHours

                })
            }
        );
}

/* Edit Service */

else if (
    currentCrudAction ===
    "edit-service"
) {

    const serviceId =
        formData.get(
            "service_id"
        );

    response =
        await fetch(
            "/api/services/" +
            serviceId,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({

                    name:
                        formData.get(
                            "service_name"
                        ),

                    category_id:
                        formData.get(
                            "category_id"
                        ),

                    location:
                        formData.get(
                            "location"
                        ),

                    status:
                        formData.get(
                            "status"
                        ),

                    working_hours:
                        formData.get(
                            "working_hours"
                        )

                })
            }
        );
}                   

                /* Deactivate Service */

else if (
    currentCrudAction ===
    "delete-service"
) {

    const serviceId =
        formData.get(
            "service_id"
        );

    response =
        await fetch(
            "/api/services/" +
            serviceId,
            {
                method: "DELETE",

                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );
}    

                /* Assign Provider */

else if (
    currentCrudAction ===
    "assign-provider"
) {

    response =
        await fetch(
            "/api/assignments",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({

                    provider_id:
                        formData.get(
                            "provider_id"
                        ),

                    service_id:
                        formData.get(
                            "service_id"
                        )

                })
            }
        );
}

                /* Remove Provider */

else if (
    currentCrudAction ===
    "remove-provider"
) {

    const assignmentId =
        formData.get(
            "assignment_id"
        );

    response =
        await fetch(
            "/api/assignments/" +
            assignmentId,
            {
                method: "DELETE",

                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );
}

                else {
                    return;
                }

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Action failed."
                    );
                }

                modalMessage.textContent =
                    data.message ||
                    "Action completed successfully.";

                modalMessage.style.display =
                    "block";

                setTimeout(function () {

                    closeCrudModal();

                    location.reload();

                }, 800);

            } catch (error) {

                console.error(
                    "CRUD API error:",
                    error
                );

                modalMessage.textContent =
                    error.message ||
                    "Unable to complete action.";

                modalMessage.style.display =
                    "block";
            }

        }
    );

}


/*ADMIN - USER MANAGEMENT*/


/* Administrator Information */

async function loadAdminInformation() {

    const adminName = document.getElementById("admin-name");
    const adminId = document.getElementById("admin-id");
    const token = localStorage.getItem("token");

    if (!adminName && !adminId) {
        return;
    }

    if (!token) {
        if (adminName) adminName.textContent = "Please login first";
        if (adminId) adminId.textContent = "Please login first";
        return;
    }

    try {

        const response = await fetch(
            "/api/auth/me",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to load administrator information."
            );
        }

        const user = data.user || data;

        if (adminName) adminName.textContent = user.full_name || "-";
        if (adminId) adminId.textContent = user.user_id || "-";

    } catch (error) {

        console.error("Admin information error:", error);
        if (adminName) adminName.textContent = "Unable to load information";
        if (adminId) adminId.textContent = "Unable to load information";
    }

}


loadAdminInformation();


/* Create User */

const createUserButton = document.getElementById("create-user-btn");

if (createUserButton) {

    createUserButton.addEventListener("click", function () {

        openCrudModal({
            title: "Create User",
            action: "create-user",
            confirmText: "Create User",
            fields: `
                <div class="form-group">
                    <label for="create-user-id">User ID</label>
                    <input type="text" id="create-user-id" name="user_id"
                        inputmode="numeric" pattern="[0-9]{14}" maxlength="14" required>
                </div>
                <div class="form-group">
                    <label for="create-user-name">Full Name</label>
                    <input type="text" id="create-user-name" name="full_name" required>
                </div>
                <div class="form-group">
                    <label for="create-user-email">Email</label>
                    <input type="email" id="create-user-email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="create-user-phone">Phone</label>
                    <input type="tel" id="create-user-phone" name="phone">
                </div>
                <div class="form-group">
                    <label for="create-user-role">Role</label>
                    <select id="create-user-role" name="role" required>
                        <option value="">Select role</option>
                        <option value="student">Student</option>
                        <option value="provider">Service Provider</option>
                        <option value="service_manager">Service Manager</option>
                        <option value="appointment_officer">Appointment Officer</option>
                        <option value="admin">Administrator</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="create-user-password">Temporary Password</label>
                    <input type="password" id="create-user-password" name="password" minlength="6" required>
                </div>
            `
        });
    });

}


/* Edit User */

function openEditUserModal(user) {

    openCrudModal({

        title: "Edit User",

        action: "edit-user",

        confirmText: "Save Changes",

        fields: `

            <input
                type="hidden"
                name="id"
                value="${user.id || ""}">

            <div class="form-group">

                <label for="edit-user-id">
                    User ID
                </label>

                <input
                    type="text"
                    id="edit-user-id"
                    name="user_id"
                    value="${user.user_id || ""}"
                    readonly>

            </div>


            <div class="form-group">

                <label for="edit-user-name">
                    Full Name
                </label>

                <input
                    type="text"
                    id="edit-user-name"
                    name="full_name"
                    value="${user.full_name || ""}"
                    required>

            </div>


            <div class="form-group">

                <label for="edit-user-email">
                    Email
                </label>

                <input
                    type="email"
                    id="edit-user-email"
                    name="email"
                    value="${user.email || ""}"
                    required>

            </div>


            <div class="form-group">

                <label for="edit-user-phone">
                    Phone Number
                </label>

                <input
                    type="tel"
                    id="edit-user-phone"
                    name="phone"
                    value="${user.phone || ""}"
                    required>

            </div>


            <div class="form-group">

                <label for="edit-user-role">
                    User Role
                </label>

                <select
                    id="edit-user-role"
                    name="role"
                    required>

                    <option value="student"
                        ${user.role === "student" ? "selected" : ""}>
                        Student
                    </option>

                    <option value="provider"
                        ${user.role === "provider" ? "selected" : ""}>
                        Service Provider
                    </option>

                    <option value="service_manager"
                        ${user.role === "service_manager" ? "selected" : ""}>
                        Service Manager
                    </option>

                    <option value="appointment_officer"
                        ${user.role === "appointment_officer" ? "selected" : ""}>
                        Appointment Officer
                    </option>

                    <option value="admin"
                        ${user.role === "admin" ? "selected" : ""}>
                        Administrator
                    </option>

                </select>

            </div>


            <div class="form-group">

                <label for="edit-user-status">
                    Account Status
                </label>

                <select
                    id="edit-user-status"
                    name="status"
                    required>

                    <option value="active"
                        ${user.is_active ? "selected" : ""}>
                        Active
                    </option>

                    <option value="inactive"
                        ${!user.is_active ? "selected" : ""}>
                        Inactive
                    </option>

                </select>

            </div>

        `

    });

}


/* Delete / Deactivate User */

function openDeleteUserModal(user) {

    openCrudModal({

        title: "Deactivate User",

        action: "delete-user",

        confirmText: "Deactivate User",

        danger: true,

        fields: `

            <input
                type="hidden"
                name="id"
                value="${user.id || ""}">

            <input
                type="hidden"
                name="user_id"
                value="${user.user_id || ""}">


            <div class="form-group">

                <p style="
                    margin: 0;
                    padding: 15px;
                    border-radius: 12px;
                    background-color: #fff7ed;
                    border: 1px solid #fed7aa;
                    color: #9a3412;
                    font-size: 14px;
                ">

                    Are you sure you want to deactivate
                    <strong>${user.full_name || "this user"}</strong>?

                    <br><br>

                    The user will no longer be able to use
                    the system.

                </p>

            </div>

        `

    });

}


/* Load Admin Users */

async function loadAdminUsers() {

    const usersTable =
        document.getElementById("admin-users");

    if (!usersTable) {
        return;
    }

    const token =
        localStorage.getItem("token");

    if (!token) {
        return;
    }

    try {

        const response = await fetch(
            "/api/users",
            {
                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );

        const users = await response.json();

        if (!response.ok) {
            throw new Error(
                users.message ||
                "Failed to load users."
            );
        }

        usersTable.innerHTML = "";

        if (!users.length) {
            usersTable.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center;">
                        No user data available
                    </td>
                </tr>
            `;
            return;
        }

        users.forEach(function (user) {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${user.user_id || "-"}</td>
                <td>${user.full_name || "-"}</td>
                <td>${user.email || "-"}</td>
                <td>${user.phone || "-"}</td>
                <td>${user.role || "-"}</td>
                <td>${user.is_active ? "Active" : "Inactive"}</td>
                <td>
                    <button type="button" class="action-btn"
                        onclick='openEditUserModal(${JSON.stringify(user)})'>
                        Edit
                    </button>
                    <button type="button" class="action-btn"
                        onclick='openDeleteUserModal(${JSON.stringify(user)})'>
                        Deactivate
                    </button>
                </td>
            `;

            usersTable.appendChild(row);
        });

    } catch (error) {

        console.error("Admin users error:", error);

        usersTable.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center;">
                    Unable to load user data
                </td>
            </tr>
        `;
    }
}


/*ADMIN - CATEGORY MANAGEMENT*/


/* Create Category */

const createCategoryButton =
    document.getElementById("create-category-btn");


if (createCategoryButton) {

    createCategoryButton.addEventListener(
        "click",
        function () {

            openCrudModal({

                title: "Create Service Category",

                action: "create-category",

                confirmText: "Create Category",

                fields: `

                    <div class="form-group">

                        <label for="category-name">
                            Category Name
                        </label>

                        <input
                            type="text"
                            id="category-name"
                            name="name"
                            placeholder="Enter category name"
                            required>

                    </div>


                    <div class="form-group">

                        <label for="category-description">
                            Description
                        </label>

                        <textarea
                            id="category-description"
                            name="description"
                            placeholder="Enter category description"
                            required></textarea>

                    </div>

                `

            });

        }
    );

}


/* Edit Category */

function openEditCategoryModal(category) {

    openCrudModal({

        title: "Edit Service Category",

        action: "edit-category",

        confirmText: "Save Changes",

        fields: `

            <input
                type="hidden"
                name="category_id"
                value="${category.id || ""}">


            <div class="form-group">

                <label for="edit-category-name">
                    Category Name
                </label>

                <input
                    type="text"
                    id="edit-category-name"
                    name="name"
                    value="${category.name || ""}"
                    required>

            </div>


            <div class="form-group">

                <label for="edit-category-description">
                    Description
                </label>

                <textarea
                    id="edit-category-description"
                    name="description"
                    required>${category.description || ""}</textarea>

            </div>


            <div class="form-group">

                <label for="edit-category-status">
                    Status
                </label>

                <select
                    id="edit-category-status"
                    name="status"
                    required>

                    <option value="active"
                        ${category.status === "active" ? "selected" : ""}>
                        Active
                    </option>

                    <option value="inactive"
                        ${category.status === "inactive" ? "selected" : ""}>
                        Inactive
                    </option>

                </select>

            </div>

        `

    });

}


/* Delete Category */

function openDeleteCategoryModal(category) {

    openCrudModal({

        title: "Delete Service Category",

        action: "delete-category",

        confirmText: "Delete Category",

        danger: true,

        fields: `

            <input
                type="hidden"
                name="category_id"
                value="${category.id || ""}">


            <div class="form-group">

                <p style="
                    margin: 0;
                    padding: 15px;
                    border-radius: 12px;
                    background-color: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #991b1b;
                    font-size: 14px;
                ">

                    Are you sure you want to delete
                    <strong>${category.name || "this category"}</strong>?

                    <br><br>

                    This action should only be performed
                    when the category is no longer required.

                </p>

            </div>

        `

    });

}


/* Load Admin Categories */

async function loadAdminCategories() {

    const categoriesTable =
        document.getElementById("admin-categories");

    if (!categoriesTable) {
        return;
    }

    const token =
        localStorage.getItem("token");

    if (!token) {
        return;
    }

    try {

        const response = await fetch(
            "/api/service-categories",
            {
                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );

        const categories = await response.json();

        if (!response.ok) {
            throw new Error(
                categories.message ||
                "Failed to load categories."
            );
        }

        categoriesTable.innerHTML = "";

        if (!categories.length) {
            categoriesTable.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center;">
                        No category data available
                    </td>
                </tr>
            `;
            return;
        }

        categories.forEach(function (category) {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${category.id || "-"}</td>
                <td>${category.name || "-"}</td>
                <td>${category.description || "-"}</td>
                <td>${category.is_active ? "Active" : "Inactive"}</td>
                <td>
                    <button type="button" class="action-btn"
                        onclick='openEditCategoryModal(${JSON.stringify(category)})'>
                        Edit
                    </button>
                    <button type="button" class="action-btn"
                        onclick='openDeleteCategoryModal(${JSON.stringify(category)})'>
                        Delete
                    </button>
                </td>
            `;

            categoriesTable.appendChild(row);
        });

    } catch (error) {

        console.error("Admin categories error:", error);

        categoriesTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">
                    Unable to load category data
                </td>
            </tr>
        `;
    }
}


loadAdminUsers();
loadAdminCategories();
/*ADMIN - SYSTEM REPORTS*/


async function loadAdminSystemReport() {

    const reportTable = document.getElementById("admin-reports");
    const token = localStorage.getItem("token");

    if (!reportTable || !token) {
        return;
    }

    try {

        const response = await fetch(
            "/api/reports/system",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );
        const report = await response.json();

        if (!response.ok) {
            throw new Error(
                report.message || "Unable to load system report."
            );
        }

        reportTable.innerHTML = `
            <tr><td>Users Report</td><td>System users and account information.</td><td>${report.users.total_users}</td><td><span class="dashboard-status available">${report.users.active_users} active / ${report.users.inactive_users} inactive</span></td></tr>
            <tr><td>Services Report</td><td>Service categories and available services.</td><td>${report.services.total_services}</td><td><span class="dashboard-status available">${report.services.active_services} active / ${report.services.inactive_services} inactive</span></td></tr>
            <tr><td>Providers Report</td><td>Registered service providers.</td><td>${report.providers.total_providers}</td><td><span class="dashboard-status available">${report.providers.active_providers} active / ${report.providers.inactive_providers} inactive</span></td></tr>
            <tr><td>Categories Report</td><td>Service categories in the system.</td><td>${report.categories.total_categories}</td><td><span class="dashboard-status available">${report.categories.active_categories} active / ${report.categories.inactive_categories} inactive</span></td></tr>
            <tr><td>Appointments Report</td><td>Appointment requests and statuses.</td><td>${report.appointments.total_appointments}</td><td><span class="dashboard-status available">${report.appointments.pending_appointments} pending / ${report.appointments.approved_appointments} approved / ${report.appointments.completed_appointments} completed</span></td></tr>
        `;

    } catch (error) {

        console.error("Admin system report error:", error);
        reportTable.innerHTML = `
            <tr><td colspan="4" style="text-align: center;">Unable to load system report</td></tr>
        `;
    }

}


loadAdminSystemReport();


/* View System Reports */

const viewReportsButton =
    document.getElementById("view-reports-btn");


if (viewReportsButton) {

    viewReportsButton.addEventListener(
        "click",
        function () {

            const reportsTable =
                document.getElementById("admin-reports");

            if (!reportsTable) {
                return;
            }

            loadAdminSystemReport();

            reportsTable.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }
    );

}


/* Download PDF */

const adminDownloadPdfButton =
    document.getElementById(
        "admin-download-pdf-btn"
    );


if (adminDownloadPdfButton) {

    adminDownloadPdfButton.addEventListener(
        "click",
        async function () {

            const token =
                localStorage.getItem("token");

            if (!token) {

                alert(
                    "Please login first."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        "/api/reports/system/pdf",
                        {
                            method: "GET",

                            headers: {
                                "Authorization":
                                    "Bearer " + token
                            }
                        }
                    );

                if (!response.ok) {

                    const data =
                        await response.json()
                            .catch(function () {
                                return {};
                            });

                    throw new Error(
                        data.message ||
                        "Failed to download PDF report."
                    );
                }

                const blob =
                    await response.blob();

                const url =
                    window.URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement("a");

                link.href = url;

                link.download =
                    "MUST_ServiceConnect_System_Report.pdf";

                document.body.appendChild(link);

                link.click();

                link.remove();

                window.URL.revokeObjectURL(
                    url
                );

            } catch (error) {

                console.error(
                    "Admin PDF download error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to download PDF report."
                );
            }

        }
    );

}


/* Download Excel */

const adminDownloadExcelButton =
    document.getElementById(
        "admin-download-excel-btn"
    );


if (adminDownloadExcelButton) {

    adminDownloadExcelButton.addEventListener(
        "click",
        async function () {

            const token =
                localStorage.getItem("token");

            if (!token) {

                alert(
                    "Please login first."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        "/api/reports/system/excel",
                        {
                            method: "GET",

                            headers: {
                                "Authorization":
                                    "Bearer " + token
                            }
                        }
                    );

                if (!response.ok) {

                    const data =
                        await response.json()
                            .catch(function () {
                                return {};
                            });

                    throw new Error(
                        data.message ||
                        "Failed to download Excel report."
                    );
                }

                const blob =
                    await response.blob();

                const url =
                    window.URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement("a");

                link.href = url;

                link.download =
                    "MUST_ServiceConnect_System_Report.xlsx";

                document.body.appendChild(link);

                link.click();

                link.remove();

                window.URL.revokeObjectURL(
                    url
                );

            } catch (error) {

                console.error(
                    "Admin Excel download error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to download Excel report."
                );
            }

        }
    );

}

/*PROVIDER DASHBOARD*/


/* Provider Dashboard Data */

const providerAppointmentsTable =
    document.getElementById("provider-appointments");

let currentProviderRecordId = null;
let providerDashboardAppointments = [];


function getStoredUser() {

    try {
        return JSON.parse(
            localStorage.getItem("user") || "null"
        );
    } catch (error) {
        return null;
    }

}


function renderProviderAppointments(appointments) {

    if (!providerAppointmentsTable) {
        return;
    }

    providerAppointmentsTable.innerHTML = "";
    providerDashboardAppointments = appointments || [];

    if (!appointments || appointments.length === 0) {
        providerAppointmentsTable.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center;">
                    No appointment data available
                </td>
            </tr>
        `;
        return;
    }

    appointments.forEach(function (appointment) {

        const encodedAppointment = encodeURIComponent(
            JSON.stringify(appointment)
        );
        const actions = [];

        if (appointment.status === "pending") {
            actions.push(`<button type="button" class="action-btn"
                onclick='openProviderAppointmentStatusModal(JSON.parse(decodeURIComponent("${encodedAppointment}")), "approved")'>Approve</button>`);
            actions.push(`<button type="button" class="action-btn"
                onclick='openProviderAppointmentStatusModal(JSON.parse(decodeURIComponent("${encodedAppointment}")), "rejected")'>Reject</button>`);
        }

        if (appointment.status === "approved") {
            actions.push(`<button type="button" class="action-btn"
                onclick='openProviderAppointmentStatusModal(JSON.parse(decodeURIComponent("${encodedAppointment}")), "completed")'>Complete</button>`);
        }

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(appointment.student_name || "-")}</td>
            <td>${escapeHtml(appointment.service_name || "-")}</td>
            <td>${escapeHtml(appointment.reason || "-")}</td>
            <td>${escapeHtml(appointment.appointment_date || "-")}</td>
            <td>${escapeHtml(appointment.appointment_time ? String(appointment.appointment_time).slice(0, 5) : "-")}</td>
            <td>
                <span class="dashboard-status ${getAppointmentStatusClass(appointment.status)}">
                    ${escapeHtml(appointment.status || "Pending")}
                </span>
            </td>
            <td>${actions.length ? actions.join("") : "-"}</td>
        `;

        providerAppointmentsTable.appendChild(row);
    });

}


async function loadProviderDashboard() {

    if (!providerAppointmentsTable && !document.getElementById("provider-name")) {
        return;
    }

    const token = localStorage.getItem("token");
    const user = getStoredUser();

    if (!token || !user || !user.id) {
        return;
    }

    try {

        const headers = {
            "Authorization": "Bearer " + token
        };

        const currentUserResponse = await fetch(
            "/api/auth/me",
            { headers: headers }
        );
        const currentUserData = await currentUserResponse.json();

        if (!currentUserResponse.ok) {
            throw new Error(
                currentUserData.message || "Unable to load provider information."
            );
        }

        const providerResponse = await fetch(
            "/api/providers",
            { headers: headers }
        );
        const providers = await providerResponse.json();

        if (!providerResponse.ok || !providers.length) {
            throw new Error("Provider account was not found.");
        }

        const provider = providers[0];
        const providerId = provider.id;
        currentProviderRecordId = providerId;

        const assignmentResponse = await fetch(
            "/api/assignments/provider/" + providerId,
            { headers: headers }
        );
        const assignments = await assignmentResponse.json();

        if (!assignmentResponse.ok) {
            throw new Error("Unable to load assigned services.");
        }

        const appointmentResponse = await fetch(
            "/api/appointments/provider/" + providerId,
            { headers: headers }
        );
        const appointments = await appointmentResponse.json();

        if (!appointmentResponse.ok) {
            throw new Error("Unable to load provider appointments.");
        }

        const service = assignments[0] || {};
        const userData = currentUserData.user || currentUserData;

        document.getElementById("provider-name").textContent =
            userData.full_name || provider.full_name || "-";
        document.getElementById("provider-id").textContent =
            provider.provider_id || "-";
        document.getElementById("assigned-service").textContent =
            assignments.length
                ? assignments.map(function (item) { return item.service_name; }).join(", ")
                : "No service assigned";
        document.getElementById("provider-location").textContent =
            service.location || "-";
        document.getElementById("provider-working-hours").textContent =
            service.working_hours || "-";

        const currentStatus = document.getElementById("current-provider-status");
        currentStatus.textContent = provider.availability || "Not set";
        currentStatus.className =
            "dashboard-status " + getServiceStatusClass(provider.availability);

        const statusSelect = document.getElementById("provider-status");
        if (statusSelect) {
            statusSelect.value = provider.availability || "";
        }

        renderProviderAppointments(appointments);

    } catch (error) {

        console.error("Provider dashboard error:", error);

        if (providerAppointmentsTable) {
            providerAppointmentsTable.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center;">
                        Unable to load provider appointments
                    </td>
                </tr>
            `;
        }
    }

}


loadProviderDashboard();


/* View Assigned Service */

const viewAssignedServiceButton =
    document.getElementById(
        "view-assigned-service-btn"
    );


if (viewAssignedServiceButton) {

    viewAssignedServiceButton.addEventListener(
        "click",
        function () {

            const providerInformation =
                document.getElementById(
                    "assigned-service"
                );

            if (!providerInformation) {
                return;
            }

            providerInformation.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }
    );

}


/* View Provider Appointments */

const viewProviderAppointmentsButton =
    document.getElementById(
        "view-provider-appointments-btn"
    );


if (viewProviderAppointmentsButton) {

    viewProviderAppointmentsButton.addEventListener(
        "click",
        function () {

            const appointmentsTable =
                document.getElementById(
                    "provider-appointments"
                );

            if (!appointmentsTable) {
                return;
            }

            appointmentsTable.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }
    );

}


/* Update Availability Button */

const updateAvailabilityButton =
    document.getElementById(
        "update-availability-btn"
    );


if (updateAvailabilityButton) {

    updateAvailabilityButton.addEventListener(
        "click",
        function () {

            const statusForm =
                document.getElementById(
                    "provider-status-form"
                );

            if (!statusForm) {
                return;
            }

            statusForm.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            const statusSelect =
                document.getElementById(
                    "provider-status"
                );

            if (statusSelect) {

                setTimeout(function () {

                    statusSelect.focus();

                }, 500);

            }

        }
    );

}


/* Provider Availability Form */

const providerStatusForm =
    document.getElementById(
        "provider-status-form"
    );

if (providerStatusForm) {

    providerStatusForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const statusSelect =
                document.getElementById(
                    "provider-status"
                );

            const currentStatus =
                document.getElementById(
                    "current-provider-status"
                );

            if (!statusSelect || !currentStatus) {
                return;
            }

            const selectedStatus =
                statusSelect.value;

            if (!selectedStatus) {
                return;
            }

            const token =
                localStorage.getItem("token");

            if (!token) {

                alert(
                    "Please login first."
                );

                return;
            }

            try {

                let providerRecordId = currentProviderRecordId;

                if (!providerRecordId) {
                    const providerResponse = await fetch(
                        "/api/providers",
                        {
                            headers: {
                                "Authorization":
                                    "Bearer " + token
                            }
                        }
                    );

                    const providers = await providerResponse.json();

                    if (!providerResponse.ok || !providers.length) {
                        throw new Error(
                            "Provider information not found."
                        );
                    }

                    providerRecordId = providers[0].id;
                }

                const response =
                    await fetch(
                        "/api/providers/" +
                        providerRecordId +
                        "/availability",
                        {
                            method: "PATCH",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " + token
                            },

                            body: JSON.stringify({
                                availability:
                                    selectedStatus
                            })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to update availability."
                    );
                }

                currentStatus.textContent =
                    selectedStatus;

                currentStatus.className =
                    "dashboard-status " +
                    selectedStatus;

                alert(
                    "Availability updated successfully."
                );

            } catch (error) {

                console.error(
                    "Provider availability error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to update availability."
                );
            }

        }
    );

}


/*PROVIDER - APPOINTMENT STATUS*/


/*
    This function will be used by
    appointment table rows.

    Example:

    openProviderAppointmentStatusModal({
        id: 101,
        student: "Student Name",
        service: "ICT Support",
        status: "pending"
    });
*/


function openProviderAppointmentStatusModal(
    appointment,
    requestedStatus
) {

    const status = requestedStatus || appointment.status;
    const encodedStudent = escapeHtml(
        appointment.student_name || appointment.student || "Student"
    );
    const encodedService = escapeHtml(
        appointment.service_name || appointment.service || "Service"
    );

    openCrudModal({

        title: "Update Appointment Status",

        action: "update-provider-appointment-status",

        confirmText: "Update Status",

        fields: `

            <input
                type="hidden"
                name="appointment_id"
                value="${appointment.id || ""}">


            <div class="form-group">

                <label>
                    Student
                </label>

                <input
                    type="text"
                    value="${encodedStudent}"
                    readonly>

            </div>


            <div class="form-group">

                <label>
                    Service
                </label>

                <input
                    type="text"
                    value="${encodedService}"
                    readonly>

            </div>


            <div class="form-group">

                <label for="provider-appointment-status">
                    Appointment Status
                </label>

                <select
                    id="provider-appointment-status"
                    name="status"
                    required>

                    <option value="">
                        Select status
                    </option>

                    <option value="approved"
                        ${status === "approved" ? "selected" : ""}>
                        Approved
                    </option>

                    <option value="rejected"
                        ${status === "rejected" ? "selected" : ""}>
                        Rejected
                    </option>

                    <option value="completed"
                        ${status === "completed" ? "selected" : ""}>
                        Completed
                    </option>

                </select>

            </div>

            <div class="form-group" id="provider-rejection-reason-group">

                <label for="provider-rejection-reason">
                    Rejection Reason
                </label>

                <textarea
                    id="provider-rejection-reason"
                    name="rejection_reason"
                    rows="3"
                    placeholder="Required when rejecting an appointment"></textarea>

            </div>

        `

    });

    const rejectionGroup = document.getElementById(
        "provider-rejection-reason-group"
    );
    const statusSelect = document.getElementById(
        "provider-appointment-status"
    );

    function updateRejectionVisibility() {
        if (rejectionGroup && statusSelect) {
            rejectionGroup.style.display =
                statusSelect.value === "rejected"
                    ? "grid"
                    : "none";
        }
    }

    if (statusSelect) {
        statusSelect.addEventListener(
            "change",
            updateRejectionVisibility
        );
        updateRejectionVisibility();
    }

}

/*PROVIDER-REPORT DOWNLOADS*/


/* Download PDF */

const providerDownloadPdfButton =
    document.getElementById(
        "provider-download-pdf-btn"
    );


if (providerDownloadPdfButton) {

    providerDownloadPdfButton.addEventListener(
        "click",
        async function () {

            const token =
                localStorage.getItem("token");

            if (!token) {

                alert(
                    "Please login first."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        "/api/reports/provider/appointments/pdf",
                        {
                            method: "GET",

                            headers: {
                                "Authorization":
                                    "Bearer " + token
                            }
                        }
                    );

                if (!response.ok) {

                    const data =
                        await response.json()
                            .catch(function () {
                                return {};
                            });

                    throw new Error(
                        data.message ||
                        "Failed to download PDF report."
                    );
                }

                const blob =
                    await response.blob();

                const url =
                    window.URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement("a");

                link.href = url;

                link.download =
                    "MUST_ServiceConnect_Provider_Appointments.pdf";

                document.body.appendChild(link);

                link.click();

                link.remove();

                window.URL.revokeObjectURL(
                    url
                );

            } catch (error) {

                console.error(
                    "Provider PDF download error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to download PDF report."
                );
            }

        }
    );

}

/* Download Excel */

const providerDownloadExcelButton =
    document.getElementById(
        "provider-download-excel-btn"
    );


if (providerDownloadExcelButton) {

    providerDownloadExcelButton.addEventListener(
        "click",
        async function () {

            const token =
                localStorage.getItem("token");

            if (!token) {

                alert(
                    "Please login first."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        "/api/reports/provider/appointments/excel",
                        {
                            method: "GET",

                            headers: {
                                "Authorization":
                                    "Bearer " + token
                            }
                        }
                    );

                if (!response.ok) {

                    const data =
                        await response.json()
                            .catch(function () {
                                return {};
                            });

                    throw new Error(
                        data.message ||
                        "Failed to download Excel report."
                    );
                }

                const blob =
                    await response.blob();

                const url =
                    window.URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement("a");

                link.href = url;

                link.download =
                    "MUST_ServiceConnect_Provider_Appointments.xlsx";

                document.body.appendChild(link);

                link.click();

                link.remove();

                window.URL.revokeObjectURL(
                    url
                );

            } catch (error) {

                console.error(
                    "Provider Excel download error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to download Excel report."
                );
            }

        }
    );

}

/* Service Manager Dashboard */

const createServiceButton =
    document.getElementById("create-service-btn");

const assignProviderButton =
    document.getElementById("assign-provider-btn");

const managerDownloadPdfButton =
    document.getElementById("manager-download-pdf-btn");

const managerDownloadExcelButton =
    document.getElementById("manager-download-excel-btn");


async function loadAssignmentOptions() {

    const providerSelect = document.getElementById("assignment-provider");
    const serviceSelect = document.getElementById("assignment-service");

    if (!providerSelect || !serviceSelect) {
        return;
    }

    const token = localStorage.getItem("token");

    try {

        const headers = {
            "Authorization": "Bearer " + token
        };

        const [providersResponse, servicesResponse] = await Promise.all([
            fetch("/api/providers", { headers: headers }),
            fetch("/api/services", { headers: headers })
        ]);

        const providers = await providersResponse.json();
        const services = await servicesResponse.json();

        if (!providersResponse.ok || !servicesResponse.ok) {
            throw new Error("Unable to load assignment options.");
        }

        providerSelect.innerHTML = `<option value="">Select provider</option>`;
        providers.filter(function (provider) {
            return provider.is_active !== false;
        }).forEach(function (provider) {
            const option = document.createElement("option");
            option.value = provider.id;
            option.textContent = provider.full_name +
                " (" + provider.provider_id + ")";
            providerSelect.appendChild(option);
        });

        serviceSelect.innerHTML = `<option value="">Select service</option>`;
        services.filter(function (service) {
            return service.is_active !== false;
        }).forEach(function (service) {
            const option = document.createElement("option");
            option.value = service.id;
            option.textContent = service.name;
            serviceSelect.appendChild(option);
        });

    } catch (error) {

        console.error("Assignment options error:", error);
        providerSelect.innerHTML = `<option value="">Unable to load providers</option>`;
        serviceSelect.innerHTML = `<option value="">Unable to load services</option>`;
    }

}


/* Service Manager Dashboard Data */

const managedServicesTable = document.getElementById(
    "managed-services"
);

const assignedProvidersTable = document.getElementById(
    "assigned-providers"
);


async function loadServiceManagerDashboard() {

    if (!managedServicesTable && !assignedProvidersTable) {
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    const headers = {
        "Authorization": "Bearer " + token
    };

    try {

        const userResponse = await fetch(
            "/api/auth/me",
            { headers: headers }
        );
        const userData = await userResponse.json();

        if (!userResponse.ok) {
            throw new Error(
                userData.message || "Unable to load manager information."
            );
        }

        const servicesResponse = await fetch(
            "/api/services",
            { headers: headers }
        );
        const services = await servicesResponse.json();

        if (!servicesResponse.ok) {
            throw new Error(
                services.message || "Unable to load services."
            );
        }

        const assignmentsResponse = await fetch(
            "/api/assignments",
            { headers: headers }
        );
        const assignments = await assignmentsResponse.json();

        if (!assignmentsResponse.ok) {
            throw new Error(
                assignments.message || "Unable to load assignments."
            );
        }

        const user = userData.user || userData;
        const managerName = document.getElementById("manager-name");
        const managerId = document.getElementById("manager-id");

        if (managerName) {
            managerName.textContent = user.full_name || "-";
        }

        if (managerId) {
            managerId.textContent = user.user_id || "-";
        }

        renderManagedServices(services, assignments);
        renderAssignedProviders(assignments);

    } catch (error) {

        console.error("Service manager dashboard error:", error);

        if (managedServicesTable) {
            managedServicesTable.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center;">
                        Unable to load service data
                    </td>
                </tr>
            `;
        }

        if (assignedProvidersTable) {
            assignedProvidersTable.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center;">
                        Unable to load assignment data
                    </td>
                </tr>
            `;
        }
    }

}


function renderManagedServices(services, assignments) {

    if (!managedServicesTable) {
        return;
    }

    managedServicesTable.innerHTML = "";

    if (!services.length) {
        managedServicesTable.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center;">
                    No service data available
                </td>
            </tr>
        `;
        return;
    }

    services.forEach(function (service) {

        const serviceAssignments = assignments.filter(function (assignment) {
            return String(assignment.service_id) === String(service.id);
        });

        const providerNames = serviceAssignments.map(function (assignment) {
            return assignment.provider_name;
        }).filter(Boolean).join(", ") || "Unassigned";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(service.name || "-")}</td>
            <td>${escapeHtml(service.category_name || "-")}</td>
            <td>${escapeHtml(service.location || "-")}</td>
            <td>
                <span class="dashboard-status ${getServiceStatusClass(service.status)}">
                    ${escapeHtml(service.status || "Unknown")}
                </span>
            </td>
            <td>${escapeHtml(providerNames)}</td>
            <td>
                <button type="button" class="action-btn"
                    onclick='openEditServiceModal(JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(service))}")))'>
                    Edit
                </button>
                <button type="button" class="action-btn"
                    onclick='openDeleteServiceModal(JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(service))}")))'>
                    Deactivate
                </button>
            </td>
        `;

        managedServicesTable.appendChild(row);
    });

}


function renderAssignedProviders(assignments) {

    if (!assignedProvidersTable) {
        return;
    }

    assignedProvidersTable.innerHTML = "";

    if (!assignments.length) {
        assignedProvidersTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">
                    No provider assignment data available
                </td>
            </tr>
        `;
        return;
    }

    assignments.forEach(function (assignment) {

        const encodedAssignment = encodeURIComponent(
            JSON.stringify(assignment)
        );
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(assignment.provider_name || "-")}</td>
            <td>${escapeHtml(assignment.provider_code || "-")}</td>
            <td>${escapeHtml(assignment.service_name || "-")}</td>
            <td>
                <span class="dashboard-status ${getServiceStatusClass(assignment.provider_status)}">
                    ${escapeHtml(assignment.provider_status || "Unknown")}
                </span>
            </td>
            <td>
                <button type="button" class="action-btn"
                    onclick='openRemoveProviderModal(JSON.parse(decodeURIComponent("${encodedAssignment}")))'>
                    Remove
                </button>
            </td>
        `;

        assignedProvidersTable.appendChild(row);
    });

}


loadServiceManagerDashboard();


/* Create Service */

if (createServiceButton) {

    createServiceButton.addEventListener(
        "click",
        function () {

            openCrudModal({

                title: "Create Service",

                action: "create-service",

                confirmText: "Create Service",

                fields: `

                    <label for="service-name">
                        Service Name
                    </label>

                    <input
                        type="text"
                        id="service-name"
                        name="service_name"
                        placeholder="Enter service name"
                        required
                    >


                    <label for="service-category">
                        Category
                    </label>

                    <select
    id="service-category"
    name="category_id"
    required
>

    <option value="">
        Loading categories...
    </option>

</select>

                    <label for="service-location">
                        Location
                    </label>

                    <input
                        type="text"
                        id="service-location"
                        name="location"
                        placeholder="Enter service location"
                        required
                    >


                    <label for="service-working-hours">
                        Working Hours
                    </label>

                    <input
                        type="text"
                        id="service-working-hours"
                        name="working_hours"
                        placeholder="08:00 - 16:00"
                        required
                    >


                    <label for="service-status">
                        Status
                    </label>

                    <select
                        id="service-status"
                        name="status"
                        required
                    >

                        <option value="available">
                            Available
                        </option>

                        <option value="busy">
                            Busy
                        </option>

                        <option value="away">
                            Away
                        </option>

                        <option value="closed">
                            Closed
                        </option>

                    </select>

                `

            });

            loadServiceCategoryOptions(
                document.getElementById("service-category")
            );

        }
    );

}

/* Load Service Categories */

async function loadServiceCategoryOptions(select, selectedId) {

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            Loading categories...
        </option>
    `;

    try {

        const response = await fetch(
            "/api/service-categories"
        );

        const categories = await response.json();

        if (!response.ok) {
            throw new Error(
                categories.message ||
                "Failed to load service categories."
            );
        }

        select.innerHTML = `
            <option value="">
                Select category
            </option>
        `;

        categories
            .filter(function (category) {
                return category.is_active !== false;
            })
            .forEach(function (category) {

                const option = document.createElement("option");

                option.value = category.id;
                option.textContent = category.name;
                option.selected = String(category.id) === String(selectedId);

                select.appendChild(option);
            });

    } catch (error) {

        console.error("Service category error:", error);

        select.innerHTML = `
            <option value="">
                Unable to load categories
            </option>
        `;
    }

}


/* Edit Service */

function openEditServiceModal(service) {

    openCrudModal({

        title: "Edit Service",

        action: "edit-service",

        confirmText: "Save Changes",

        fields: `

           <input
    type="hidden"
    name="service_id"
    value="${service.id || ""}"
>     
        
            <label for="edit-service-name">
                Service Name
            </label>

            <input
                type="text"
                id="edit-service-name"
                name="service_name"
                value="${service.name || ""}"
                required
            >


            <label for="edit-service-category">
                Category
            </label>

            <select
                id="edit-service-category"
                name="category_id"
                required
            >

            </select>


            <label for="edit-service-location">
                Location
            </label>

            <input
                type="text"
                id="edit-service-location"
                name="location"
                value="${service.location || ""}"
                required
            >


            <label for="edit-service-working-hours">
                Working Hours
            </label>

            <input
                type="text"
                id="edit-service-working-hours"
                name="working_hours"
                value="${service.working_hours || ""}"
                placeholder="08:00 - 16:00"
                required
            >


            <label for="edit-service-status">
                Status
            </label>

            <select
                id="edit-service-status"
                name="status"
                required
            >

                <option value="available">
                    Available
                </option>

                <option value="busy">
                    Busy
                </option>

                <option value="away">
                    Away
                </option>

                <option value="closed">
                    Closed
                </option>

            </select>

        `

    });

    loadServiceCategoryOptions(
        document.getElementById("edit-service-category"),
        service.category_id
    );

}


/* Deactivate Service */

function openDeleteServiceModal(service) {

    openCrudModal({

        title: "Deactivate Service",

        action: "delete-service",

        confirmText: "Deactivate",

        danger: true,

        fields: `

            <p>
                Are you sure you want to deactivate
                <strong>
                    ${service.name || "this service"}
                </strong>?
            </p>

            <input
                type="hidden"
                name="service_id"
                value="${service.id || ""}"
            >

        `

    });

}


/* Assign Provider */

if (assignProviderButton) {

    assignProviderButton.addEventListener(
        "click",
        function () {

            openCrudModal({

                title: "Assign Provider",

                action: "assign-provider",

                confirmText: "Assign Provider",

                fields: `

                    <label for="assignment-provider">
    Provider
</label>

<select
    id="assignment-provider"
    name="provider_id"
    required
>

    <option value="">
        Loading providers...
    </option>

</select>


                    <label for="assignment-service">
    Service
</label>

<select
    id="assignment-service"
    name="service_id"
    required
>

    <option value="">
        Loading services...
    </option>

</select>

                `

            });

            loadAssignmentOptions();

        }
    );

}


/* Remove Provider */

function openRemoveProviderModal(assignment) {

    openCrudModal({

        title: "Remove Provider",

        action: "remove-provider",

        confirmText: "Remove",

        danger: true,

        fields: `

            <p>
                Are you sure you want to remove
                <strong>
                    ${assignment.provider_name || "this provider"}
                </strong>
                from
                <strong>
                    ${assignment.service_name || "this service"}
                </strong>?
            </p>
            <input
                type="hidden"
                name="assignment_id"
                value="${assignment.id || ""}">

        `

    });

}


/* Manager PDF */

if (managerDownloadPdfButton) {

    managerDownloadPdfButton.addEventListener(
        "click",
        async function () {

            const token =
                localStorage.getItem("token");

            if (!token) {

                alert(
                    "Please login first."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        "/api/reports/services/pdf",
                        {
                            method: "GET",

                            headers: {
                                "Authorization":
                                    "Bearer " + token
                            }
                        }
                    );

                if (!response.ok) {

                    const data =
                        await response.json()
                            .catch(function () {
                                return {};
                            });

                    throw new Error(
                        data.message ||
                        "Failed to download PDF report."
                    );
                }

                const blob =
                    await response.blob();

                const url =
                    window.URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement("a");

                link.href = url;

                link.download =
                    "MUST_ServiceConnect_Services.pdf";

                document.body.appendChild(link);

                link.click();

                link.remove();

                window.URL.revokeObjectURL(
                    url
                );

            } catch (error) {

                console.error(
                    "Service Manager PDF error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to download PDF report."
                );
            }

        }
    );

}


/* Manager Excel */

if (managerDownloadExcelButton) {

    managerDownloadExcelButton.addEventListener(
        "click",
        async function () {

            const token =
                localStorage.getItem("token");

            if (!token) {

                alert(
                    "Please login first."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        "/api/reports/services/excel",
                        {
                            method: "GET",

                            headers: {
                                "Authorization":
                                    "Bearer " + token
                            }
                        }
                    );

                if (!response.ok) {

                    const data =
                        await response.json()
                            .catch(function () {
                                return {};
                            });

                    throw new Error(
                        data.message ||
                        "Failed to download Excel report."
                    );
                }

                const blob =
                    await response.blob();

                const url =
                    window.URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement("a");

                link.href = url;

                link.download =
                    "MUST_ServiceConnect_Services.xlsx";

                document.body.appendChild(link);

                link.click();

                link.remove();

                window.URL.revokeObjectURL(
                    url
                );

            } catch (error) {

                console.error(
                    "Service Manager Excel error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to download Excel report."
                );
            }

        }
    );

}

/* Student Dashboard */


/* Student Information */

async function loadStudentInformation() {

    const token = localStorage.getItem("token");
    const studentName = document.getElementById("student-name");
    const studentId = document.getElementById("student-id");
    const studentEmail = document.getElementById("student-email");

    if (!studentName && !studentId && !studentEmail) {
        return;
    }

    if (!token) {
        [studentName, studentId, studentEmail]
            .filter(Boolean)
            .forEach(function (element) {
                element.textContent = "Please login first";
            });
        return;
    }

    try {

        const response = await fetch(
            "/api/auth/me",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to load student information."
            );
        }

        const user = data.user || data;

        if (studentName) {
            studentName.textContent = user.full_name || "-";
        }

        if (studentId) {
            studentId.textContent = user.user_id || "-";
        }

        if (studentEmail) {
            studentEmail.textContent = user.email || "-";
        }

        localStorage.setItem("user", JSON.stringify(user));

    } catch (error) {

        console.error("Student information error:", error);

        [studentName, studentId, studentEmail]
            .filter(Boolean)
            .forEach(function (element) {
                element.textContent = "Unable to load information";
            });
    }

}


loadStudentInformation();


/* Student Appointments Table */

const studentAppointments =
    document.getElementById("student-appointments");


function renderStudentAppointments(appointments) {

    if (!studentAppointments) {
        return;
    }

    studentAppointments.innerHTML = "";

    if (!appointments || appointments.length === 0) {

        studentAppointments.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align: center;">
                    No appointment data available
                </td>
            </tr>
        `;

        return;
    }


    appointments.forEach(function (appointment) {

        const row =
            document.createElement("tr");

        const canEdit = appointment.status === "pending";
        const canCancel = [
            "pending",
            "approved",
            "rejected"
        ].includes(appointment.status);

        const encodedAppointment = encodeURIComponent(
            JSON.stringify(appointment)
        );

        row.innerHTML = `

            <td>
                ${escapeHtml(appointment.service_name || "-")}
            </td>

            <td>
                ${escapeHtml(appointment.provider_name || "-")}
            </td>

            <td>
                ${escapeHtml(appointment.reason || "-")}
            </td>

            <td>
                ${escapeHtml(appointment.appointment_date || "-")}
            </td>

            <td>
                ${escapeHtml(
                    appointment.appointment_time
                        ? String(appointment.appointment_time).slice(0, 5)
                        : "-"
                )}
            </td>

            <td>
                <span class="dashboard-status ${getAppointmentStatusClass(appointment.status)}">
                    ${escapeHtml(appointment.status || "Pending")}
                </span>
            </td>

            <td>

                ${canEdit ? `<button
                    type="button"
                    class="action-btn"
                    onclick='openStudentEditAppointmentModal(JSON.parse(decodeURIComponent("${encodedAppointment}")))'>

                    Edit

                </button>` : ""}


                ${canCancel ? `<button
                    type="button"
                    class="action-btn"
                    onclick='openStudentCancelAppointmentModal(JSON.parse(decodeURIComponent("${encodedAppointment}")))'>

                    Cancel

                </button>` : ""}

                ${!canEdit && !canCancel ? "-" : ""}

            </td>

        `;

        studentAppointments.appendChild(row);

    });

}

/* Load Student Appointments */

async function loadStudentAppointments() {

    if (!studentAppointments) {
        return;
    }

    const token =
        localStorage.getItem("token");

    let user = null;

    try {
        user = JSON.parse(
            localStorage.getItem("user") || "null"
        );
    } catch (error) {
        console.error("Invalid stored user data:", error);
    }

    if (!token || !user || !user.id) {

        studentAppointments.innerHTML = `
            <tr>
                    <td colspan="7"
                    style="text-align: center;">
                    Please login first
                </td>
            </tr>
        `;

        return;
    }

    try {

        const response =
            await fetch(
                "/api/appointments/student/" +
                user.id,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );

        const appointments =
            await response.json();

        if (!response.ok) {

            throw new Error(
                appointments.message ||
                "Failed to load appointments."
            );
        }

        renderStudentAppointments(
            appointments
        );

    } catch (error) {

        console.error(
            "Student appointments error:",
            error
        );

        studentAppointments.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align: center;">
                    Unable to load appointments
                </td>
            </tr>
        `;

    }

} 
loadStudentAppointments();


/* Appointment Status Class */

function getAppointmentStatusClass(status) {

    switch (status) {

        case "approved":
            return "approved";

        case "rejected":
            return "rejected";

        case "completed":
            return "completed";

        case "cancelled":
            return "cancelled";

        default:
            return "pending";
    }

}


/* Edit Appointment */

function openStudentEditAppointmentModal(appointment) {

    openCrudModal({

        title: "Update Appointment",

        action: "edit-student-appointment",

        confirmText: "Save Changes",

        fields: `

            <input
                type="hidden"
                name="appointment_id"
                value="${appointment.id || ""}"
            >


            <label for="student-edit-reason">
                Reason
            </label>

            <textarea
                id="student-edit-reason"
                name="reason"
                rows="4"
                required
            >${appointment.reason || ""}</textarea>


            <label for="student-edit-date">
                Appointment Date
            </label>

            <input
                type="date"
                id="student-edit-date"
                name="appointment_date"
                value="${appointment.appointment_date || ""}"
                required
            >


        `

    });

}


/* Cancel Appointment */

function openStudentCancelAppointmentModal(appointment) {

    openCrudModal({

        title: "Cancel Appointment",

        action: "cancel-student-appointment",

        confirmText: "Cancel Appointment",

        danger: true,

        fields: `

            <p>
                Are you sure you want to cancel this appointment?
            </p>


            <p>
                <strong>
                    ${appointment.service_name || "Selected Service"}
                </strong>
            </p>


            <input
                type="hidden"
                name="appointment_id"
                value="${appointment.id || ""}"
            >

        `

    });

}


/* Download PDF */

const studentDownloadPdfButton =
    document.getElementById(
        "download-pdf-btn"
    );

if (studentDownloadPdfButton) {

    studentDownloadPdfButton.addEventListener(
        "click",
        async function () {

            const token =
                localStorage.getItem("token");

            if (!token) {

                alert(
                    "Please login first."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        "/api/reports/student/appointments/pdf",
                        {
                            method: "GET",

                            headers: {
                                "Authorization":
                                    "Bearer " + token
                            }
                        }
                    );

                if (!response.ok) {

                    throw new Error(
                        "Failed to generate PDF report."
                    );
                }

                const blob =
                    await response.blob();

                const url =
                    window.URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement("a");

                link.href = url;

                link.download =
                    "MUST_ServiceConnect_Student_Appointments.pdf";

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();

                window.URL.revokeObjectURL(
                    url
                );

            } catch (error) {

                console.error(
                    "Student PDF error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to download PDF report."
                );
            }

        }
    );

}


/* Download Excel */

const studentDownloadExcelButton =
    document.getElementById(
        "download-excel-btn"
    );

if (studentDownloadExcelButton) {

    studentDownloadExcelButton.addEventListener(
        "click",
        async function () {

            const token =
                localStorage.getItem("token");

            if (!token) {

                alert(
                    "Please login first."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        "/api/reports/student/appointments/excel",
                        {
                            method: "GET",

                            headers: {
                                "Authorization":
                                    "Bearer " + token
                            }
                        }
                    );

                if (!response.ok) {

                    throw new Error(
                        "Failed to generate Excel report."
                    );
                }

                const blob =
                    await response.blob();

                const url =
                    window.URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement("a");

                link.href = url;

                link.download =
                    "MUST_ServiceConnect_Student_Appointments.xlsx";

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();

                window.URL.revokeObjectURL(
                    url
                );

            } catch (error) {

                console.error(
                    "Student Excel error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to download Excel report."
                );
            }

        }
    );

}

/* Appointment Officer Dashboard */


/* Officer Appointments Table */

const officerAppointments =
    document.getElementById("officer-appointments");


async function loadOfficerInformation() {

    const token = localStorage.getItem("token");
    const officerName = document.getElementById("officer-name");
    const officerId = document.getElementById("officer-id");

    if (!officerName && !officerId) {
        return;
    }

    if (!token) {
        if (officerName) officerName.textContent = "Please login first";
        if (officerId) officerId.textContent = "Please login first";
        return;
    }

    try {

        const response = await fetch(
            "/api/auth/me",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to load officer information."
            );
        }

        const user = data.user || data;

        if (officerName) officerName.textContent = user.full_name || "-";
        if (officerId) officerId.textContent = user.user_id || "-";

    } catch (error) {

        console.error("Officer information error:", error);
        if (officerName) officerName.textContent = "Unable to load information";
        if (officerId) officerId.textContent = "Unable to load information";
    }

}


loadOfficerInformation();


function renderOfficerAppointments(appointments) {

    if (!officerAppointments) {
        return;
    }

    officerAppointments.innerHTML = "";


    if (!appointments || appointments.length === 0) {

        officerAppointments.innerHTML = `
            <tr>
                <td colspan="8"
                    style="text-align: center;">

                    No appointment data available

                </td>
            </tr>
        `;

        return;
    }


    appointments.forEach(function (appointment) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(appointment.student_name || "-")}
            </td>


            <td>
                ${escapeHtml(appointment.service_name || "-")}
            </td>


            <td>
                ${escapeHtml(appointment.provider_name || "-")}
            </td>


            <td>
                ${escapeHtml(appointment.reason || "-")}
            </td>

            <td>
                ${escapeHtml(appointment.appointment_date || "-")}
            </td>

            <td>
                ${escapeHtml(
                    appointment.appointment_time
                        ? String(appointment.appointment_time).slice(0, 5)
                        : "-"
                )}
            </td>


            <td>

                <span class="dashboard-status ${getOfficerAppointmentStatusClass(appointment.status)}">

                    ${escapeHtml(appointment.status || "pending")}

                </span>

            </td>


            <td>

                ${getOfficerAppointmentActions(appointment)}

            </td>

        `;


        officerAppointments.appendChild(row);

    });

} 

 /* Load Officer Appointments */

async function loadOfficerAppointments() {

    if (!officerAppointments) {
        return;
    }

    const token =
        localStorage.getItem("token");

    if (!token) {

        officerAppointments.innerHTML = `
            <tr>
                <td colspan="8"
                    style="text-align: center;">
                    Please login first
                </td>
            </tr>
        `;

        return;
    }

    try {

        const response =
            await fetch(
                "/api/appointments",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );

        const appointments =
            await response.json();

        if (!response.ok) {

            throw new Error(
                appointments.message ||
                "Failed to load appointments."
            );
        }

        renderOfficerAppointments(
            appointments
        );

    } catch (error) {

        console.error(
            "Officer appointments error:",
            error
        );

        officerAppointments.innerHTML = `
            <tr>
                <td colspan="8"
                    style="text-align: center;">
                    Unable to load appointments
                </td>
            </tr>
        `;

    }

}


loadOfficerAppointments();


/* Appointment Status Class */

function getOfficerAppointmentStatusClass(status) {

    switch (status) {

        case "approved":
            return "approved";

        case "rejected":
            return "rejected";

        case "completed":
            return "completed";

        case "cancelled":
            return "cancelled";

        default:
            return "pending";

    }

}


/* Appointment Row Actions */

function getOfficerAppointmentActions(appointment) {

    const status =
        appointment.status || "pending";

    const encodedAppointment = encodeURIComponent(
        JSON.stringify(appointment)
    );


    if (status === "pending") {

        return `

            <button
                type="button"
                class="action-btn"
                onclick='openApproveAppointmentModal(JSON.parse(decodeURIComponent("${encodedAppointment}")))'>

                Approve

            </button>


            <button
                type="button"
                class="action-btn"
                onclick='openRejectAppointmentModal(JSON.parse(decodeURIComponent("${encodedAppointment}")))'>

                Reject

            </button>

        `;

    }


    if (status === "approved") {

        return `

            <button
                type="button"
                class="action-btn"
                onclick='openCompleteAppointmentModal(JSON.parse(decodeURIComponent("${encodedAppointment}")))'>

                Complete

            </button>


            <button
                type="button"
                class="action-btn"
                onclick='openCancelOfficerAppointmentModal(JSON.parse(decodeURIComponent("${encodedAppointment}")))'>

                Cancel

            </button>

        `;

    }


    if (status === "rejected") {

        return `

            <button
                type="button"
                class="action-btn"
                onclick='openCancelOfficerAppointmentModal(JSON.parse(decodeURIComponent("${encodedAppointment}")))'>

                Cancel

            </button>

        `;

    }


    return `

        <span>
            No actions
        </span>

    `;

}


/* Approve Appointment */

function openApproveAppointmentModal(appointment) {

    openCrudModal({

        title: "Approve Appointment",

        action: "approve-appointment",

        confirmText: "Approve",

        fields: `

            <p>
                Approve appointment for
                <strong>
                    ${appointment.student_name || "this student"}
                </strong>?
            </p>


            <p>
                Service:
                <strong>
                    ${appointment.service_name || "-"}
                </strong>
            </p>


            <input
                type="hidden"
                name="appointment_id"
                value="${appointment.id || ""}"
            >

            <input
                type="hidden"
                name="status"
                value="approved"
            >

        `

    });

}


/* Reject Appointment */

function openRejectAppointmentModal(appointment) {

    openCrudModal({

        title: "Reject Appointment",

        action: "reject-appointment",

        confirmText: "Reject",

        danger: true,

        fields: `

            <p>
                Reject appointment for
                <strong>
                    ${appointment.student_name || "this student"}
                </strong>?
            </p>


            <p>
                Service:
                <strong>
                    ${appointment.service_name || "-"}
                </strong>
            </p>


            <label for="rejection-reason">
                Reason for Rejection
            </label>

            <textarea
                id="rejection-reason"
                name="rejection_reason"
                rows="4"
                placeholder="Enter reason for rejection"
                required
            ></textarea>


            <input
                type="hidden"
                name="appointment_id"
                value="${appointment.id || ""}"
            >

            <input
                type="hidden"
                name="status"
                value="rejected"
            >

        `

    });

}


/* Complete Appointment */

function openCompleteAppointmentModal(appointment) {

    openCrudModal({

        title: "Mark Appointment Completed",

        action: "complete-appointment",

        confirmText: "Mark Completed",

        fields: `

            <p>
                Mark this appointment as completed?
            </p>


            <p>
                Student:
                <strong>
                    ${appointment.student_name || "-"}
                </strong>
            </p>


            <p>
                Service:
                <strong>
                    ${appointment.service_name || "-"}
                </strong>
            </p>


            <input
                type="hidden"
                name="appointment_id"
                value="${appointment.id || ""}"
            >

            <input
                type="hidden"
                name="status"
                value="completed"
            >

        `

    });

}


/* Cancel Appointment */

function openCancelOfficerAppointmentModal(appointment) {

    openCrudModal({

        title: "Cancel Appointment",

        action: "cancel-officer-appointment",

        confirmText: "Cancel Appointment",

        danger: true,

        fields: `

            <p>
                Are you sure you want to cancel this appointment?
            </p>


            <p>
                Student:
                <strong>
                    ${appointment.student_name || "-"}
                </strong>
            </p>


            <p>
                Service:
                <strong>
                    ${appointment.service_name || "-"}
                </strong>
            </p>


            <input
                type="hidden"
                name="appointment_id"
                value="${appointment.id || ""}"
            >

            <input
                type="hidden"
                name="status"
                value="cancelled"
            >

        `

    });

}


/* View Appointment Report */

const officerViewReportButton =
    document.getElementById("officer-view-report-btn");


if (officerViewReportButton) {

    officerViewReportButton.addEventListener(
        "click",
        function () {

            const appointmentTable =
                document.getElementById(
                    "officer-appointments"
                );


            if (!appointmentTable) {
                return;
            }


            appointmentTable.closest(
                ".status-section"
            ).scrollIntoView({

                behavior: "smooth",

                block: "center"

            });

        }
    );

}


/* Download PDF */

const officerDownloadPdfButton =
    document.getElementById(
        "officer-download-pdf-btn"
    );


if (officerDownloadPdfButton) {

    officerDownloadPdfButton.addEventListener(
        "click",
        async function () {

            const token = localStorage.getItem("token");

            if (!token) {
                alert("Please login first.");
                return;
            }

            try {

                const response = await fetch(
                    "/api/reports/appointments/pdf",
                    {
                        method: "GET",
                        headers: {
                            "Authorization": "Bearer " + token
                        }
                    }
                );

                if (!response.ok) {
                    const data = await response.json().catch(function () {
                        return {};
                    });
                    throw new Error(
                        data.message || "Failed to generate PDF report."
                    );
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");

                link.href = url;
                link.download =
                    "MUST_ServiceConnect_Appointment_Report.pdf";
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);

            } catch (error) {

                console.error("Officer PDF error:", error);
                alert(error.message || "Unable to download PDF report.");
            }

        }
    );

}


/* Download Excel */

const officerDownloadExcelButton =
    document.getElementById(
        "officer-download-excel-btn"
    );

if (officerDownloadExcelButton) {

    officerDownloadExcelButton.addEventListener(
        "click",
        async function () {

            const token =
                localStorage.getItem("token");

            if (!token) {

                alert(
                    "Please login first."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        "/api/reports/appointments/excel",
                        {
                            method: "GET",

                            headers: {
                                "Authorization":
                                    "Bearer " + token
                            }
                        }
                    );

                if (!response.ok) {

                    throw new Error(
                        "Failed to generate Excel report."
                    );
                }

                const blob =
                    await response.blob();

                const url =
                    window.URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement("a");

                link.href = url;

                link.download =
                    "MUST_ServiceConnect_Appointment_Report.xlsx";

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();

                window.URL.revokeObjectURL(
                    url
                );

            } catch (error) {

                console.error(
                    "Officer Excel error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to download Excel report."
                );
            }

        }
    );

}

/* Student Signup */

const signupForm = document.getElementById("signup-form");

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const formData = new FormData(signupForm);
            const studentId = String(
                formData.get("student-id") || ""
            ).trim();
            const password = String(
                formData.get("password") || ""
            );
            const confirmPassword = String(
                formData.get("confirm-password") || ""
            );

            if (!/^\d{14}$/.test(studentId)) {
                alert("Student ID must contain exactly 14 digits.");
                return;
            }

            if (password.length < 6) {
                alert("Password must contain at least 6 characters.");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            const submitButton = signupForm.querySelector(
                "button[type='submit']"
            );

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Creating Account...";
            }

            try {

                const response = await fetch(
                    "/api/auth/register",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            user_id: studentId,
                            full_name: formData.get("fullname"),
                            email: formData.get("email"),
                            phone: formData.get("phone"),
                            password: password
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to create account."
                    );
                }

                alert(
                    "Account created successfully. Please log in."
                );
                window.location.href = "login.html";

            } catch (error) {

                console.error("Signup error:", error);
                alert(error.message || "Unable to create account.");

            } finally {

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Create Account";
                }
            }

        }
    );

}


/* Login */

const loginForm =
    document.getElementById("login-form");

const loginMessage =
    document.getElementById("login-message");

if (loginForm && loginMessage) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const loginId =
                document.getElementById("login-id").value.trim();

            const password =
                document.getElementById("login-password").value;

            loginMessage.innerHTML = `
                <p>
                    Logging in...
                </p>
            `;

            loginMessage.style.display = "block";

            try {

            const response = await fetch("https://must-serviceconnect-backend.onrender.com/api/auth/login", {
                method: "POST",

                headers: {
        "Content-Type": "application/json"
        },

        body: JSON.stringify({
        login: loginId,
        password: password
    })
});
       const data = await response.json();            

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Login failed."
                    );
                }

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                loginMessage.innerHTML = `
                    <p>
                        <strong>
                            Login successful.
                        </strong>
                    </p>

                    <p>
                        Welcome,
                        <strong>
                            ${data.user.full_name}
                        </strong>.
                    </p>
                `;

                loginMessage.style.display = "block";

                setTimeout(function () {

                    const role =
                        data.user.role;

                    if (role === "student") {
                        window.location.href =
                            "student-dashboard.html";

                    } else if (role === "provider") {
                        window.location.href =
                            "provider-dashboard.html";

                    } else if (
                        role === "service_manager"
                    ) {
                        window.location.href =
                            "service-manager-dashboard.html";

                    } else if (
                        role === "appointment_officer"
                    ) {
                        window.location.href =
                            "appointment-officer-dashboard.html";

                    } else if (role === "admin") {
                        window.location.href =
                            "admin-dashboard.html";

                    } else {
                        window.location.href =
                            "index.html";
                    }

                }, 1000);

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                loginMessage.innerHTML = `
                    <p>
                        <strong>
                            Login failed.
                        </strong>
                    </p>

                    <p>
                        ${error.message}
                    </p>
                `;

                loginMessage.style.display = "block";
            }
        }
    );
}