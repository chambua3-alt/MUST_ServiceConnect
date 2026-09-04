/* Service Search */

const searchInput = document.getElementById("service-search");

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const searchValue = this.value.toLowerCase();

        const tables = document.querySelectorAll(".service-table");

        tables.forEach(function (table) {

            const rows = table.querySelectorAll("tbody tr");

            rows.forEach(function (row) {

                const rowText = row.textContent.toLowerCase();

                if (rowText.includes(searchValue)) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }

            });

        });

    });

}


/* Service Category and Service */

const serviceCategory =
    document.getElementById("service-category");

const serviceSelect =
    document.getElementById("service");

const services = {

    lecturer: [
        {
            value: "programming-consultation",
            name: "Programming Consultation"
        },
        {
            value: "engineering-consultation",
            name: "Engineering Consultation"
        },
        {
            value: "networking-consultation",
            name: "Networking Consultation"
        }
    ],

    office: [
        {
            value: "academic-office",
            name: "Academic Office"
        },
        {
            value: "finance-office",
            name: "Finance Office"
        },
        {
            value: "dean-of-students",
            name: "Dean of Students"
        }
    ],

    "important-service": [
        {
            value: "ict-support",
            name: "ICT Support"
        },
        {
            value: "library",
            name: "University Library"
        },
        {
            value: "medical-centre",
            name: "Medical Centre"
        }
    ]

};


if (serviceCategory && serviceSelect) {

    serviceCategory.addEventListener("change", function () {

        const selectedCategory = this.value;

        serviceSelect.innerHTML = "";

        if (!selectedCategory) {

            serviceSelect.innerHTML = `
                <option value="">
                    Select a category first
                </option>
            `;

            return;
        }

        serviceSelect.innerHTML = `
            <option value="">
                Select a service
            </option>
        `;

        services[selectedCategory].forEach(function (service) {

            const option = document.createElement("option");

            option.value = service.value;
            option.textContent = service.name;

            serviceSelect.appendChild(option);

        });

    });

}

/* Service Provider */

const providerSelect =
    document.getElementById("service-provider");

if (serviceSelect && providerSelect) {

    const providers = {

        "programming-consultation": [
            {
                value: "dr-john",
                name: "Dr. John M."
            }
        ],

        "engineering-consultation": [
            {
                value: "dr-sarah",
                name: "Dr. Sarah K."
            }
        ],

        "networking-consultation": [
            {
                value: "mr-david",
                name: "Mr. David P."
            }
        ],

        "academic-office": [
            {
                value: "academic-office",
                name: "Academic Office"
            }
        ],

        "finance-office": [
            {
                value: "finance-office",
                name: "Finance Office"
            }
        ],

        "dean-of-students": [
            {
                value: "dean-of-students",
                name: "Dean of Students"
            }
        ],

        "ict-support": [
            {
                value: "ict-office",
                name: "ICT Support Office"
            }
        ],

        "library": [
            {
                value: "library",
                name: "University Library"
            }
        ],

        "medical-centre": [
            {
                value: "medical-centre",
                name: "Medical Centre"
            }
        ]

    };


    serviceSelect.addEventListener("change", function () {

        const selectedService = this.value;

        providerSelect.innerHTML = "";

        if (!selectedService) {

            providerSelect.innerHTML = `
                <option value="">
                    Select a service first
                </option>
            `;

            return;
        }

        providerSelect.innerHTML = `
            <option value="">
                Select person or office
            </option>
        `;

        providers[selectedService].forEach(function (provider) {

            const option = document.createElement("option");

            option.value = provider.value;
            option.textContent = provider.name;

            providerSelect.appendChild(option);

        });

    });

}

/* Appointment Submission */

const appointmentForm =
    document.getElementById("appointment-form");

const appointmentMessage =
    document.getElementById("appointment-message");

if (appointmentForm && appointmentMessage) {

    appointmentForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const appointmentDate = "Tomorrow";
        const appointmentTime = "10:00 AM";

        appointmentMessage.innerHTML = `
            <p>
                <strong>Appointment request submitted successfully.</strong>
            </p>

            <p>
                Your appointment has been scheduled for
                <strong>${appointmentDate}</strong>
                at
                <strong>${appointmentTime}</strong>.
            </p>

            <p>
                Please arrive on time and maintain a neat,
                clean and respectful appearance.
            </p>
        `;

        appointmentMessage.style.display = "block";

        appointmentForm.reset();

        serviceSelect.innerHTML = `
            <option value="">
                Select a category first
            </option>
        `;

        providerSelect.innerHTML = `
            <option value="">
                Select a service first
            </option>
        `;

    });

}