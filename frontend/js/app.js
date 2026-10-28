const body = document.body;

const themeBtn = document.getElementById("themeBtn");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");
const logoInput = document.getElementById("logoInput");
const qrPaper = document.getElementById("qrPaper");

/* Navigation */
const primaryNav = document.getElementById("primaryNav");
const navToggle = document.getElementById("navToggle");
const navLinks = Array.from(primaryNav.querySelectorAll("a"));
const navSections = Array.from(document.querySelectorAll("[data-nav-section]"));

if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
}

function closeNavMenu() {
    primaryNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
}

navToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
    );
});

navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;

        event.preventDefault();
        const hash = link.getAttribute("href");

        if (window.location.hash !== hash) {
            window.history.pushState(
                { section: hash.slice(1) },
                "",
                hash
            );
        }

        target.scrollIntoView({ behavior: "smooth", block: "start" });
        closeNavMenu();
        setActiveNav(hash.slice(1));
    });
});

function setActiveNav(sectionId) {
    navLinks.forEach((link) => {
        const isActive =
            link.getAttribute("href") === `#${sectionId}`;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

function updateActiveNav() {
    const marker =
        document.querySelector("header").getBoundingClientRect().bottom + 28;

    let currentSection = navSections[0];

    navSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= marker) {
            currentSection = section;
        }
    });

    if (currentSection) setActiveNav(currentSection.id);
}

function scrollToHash(behavior = "instant") {
    const hash = window.location.hash;
    const target = hash
        ? document.querySelector(hash)
        : navSections[0];

    if (!target) return;

    target.scrollIntoView({ behavior, block: "start" });
    setActiveNav(target.id);
}

window.addEventListener("scroll", updateActiveNav, { passive: true });

function restoreHashScroll() {
    window.setTimeout(() => scrollToHash("instant"), 50);
}

window.addEventListener("popstate", restoreHashScroll);
window.addEventListener("hashchange", restoreHashScroll);

window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 821px)").matches) {
        closeNavMenu();
    }
    updateActiveNav();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavMenu();
});

if (window.location.hash) {
    requestAnimationFrame(() => scrollToHash("instant"));
} else {
    updateActiveNav();
}

/* Logo upload and preview */
const logoPreview = document.getElementById("logoPreview");
const logoName = document.getElementById("logoName");
const removeLogo = document.getElementById("removeLogo");

logoInput.addEventListener("change", () => {
    const file = logoInput.files[0];

    if (file) {
        logoName.textContent = file.name;
        logoPreview.style.display = "flex";
    } else {
        logoPreview.style.display = "none";
        logoName.textContent = "";
    }
});

removeLogo.addEventListener("click", () => {
    logoInput.value = "";
    logoName.textContent = "";
    logoPreview.style.display = "none";
});

/* Theme */
function applyTheme(theme) {
    const dark = theme === "dark";

    body.classList.toggle("dark", dark);
    themeIcon.textContent = dark ? "☀" : "☾";
    themeLabel.textContent = dark ? "Light" : "Dark";

    localStorage.setItem("qr-theme", theme);
}

applyTheme(localStorage.getItem("qr-theme") || "light");

themeBtn.addEventListener("click", () => {
    applyTheme(body.classList.contains("dark") ? "light" : "dark");
});

/* QR content types */
let currentMode = "url";
let currentPayload = "";
let currentQRImage = "";

const typesMore = document.querySelector(".types-more");
const typesOverflow = document.querySelector(".types-overflow");
const typesContainer = document.querySelector(".types");
const typeButtons = Array.from(
    document.querySelectorAll(".types .type-btn")
);

function syncTypeOptions() {
    const isPhone = window.matchMedia("(max-width: 600px)").matches;

    const visibleModes = isPhone
        ? (window.innerWidth < 430
            ? ["url", "whatsapp", "email"]
            : ["url", "whatsapp", "email", "sms"])
        : ["url", "whatsapp", "email", "sms", "wifi"];

    typeButtons.forEach((button) => {
        const target = visibleModes.includes(button.dataset.mode)
            ? typesContainer
            : typesOverflow;

        if (target === typesContainer) {
            typesContainer.insertBefore(button, typesMore);
        } else {
            typesOverflow.appendChild(button);
        }
    });
}

syncTypeOptions();
window.addEventListener("resize", syncTypeOptions);

typesMore.addEventListener("click", (event) => {
    event.stopPropagation();

    const expanded =
        typesMore.getAttribute("aria-expanded") === "true";

    typesMore.setAttribute("aria-expanded", String(!expanded));
    typesOverflow.classList.toggle("open", !expanded);
});

document.querySelectorAll(".type-btn").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".type-btn").forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        currentMode = button.dataset.mode;

        document.querySelectorAll(".mode").forEach((mode) => {
            mode.classList.remove("active");
        });

        document.getElementById(currentMode + "Mode").classList.add("active");

        clearAllValidationErrors();
        typesMore.setAttribute("aria-expanded", "false");
        typesOverflow.classList.remove("open");
    });
});

document.addEventListener("click", () => {
    typesMore.setAttribute("aria-expanded", "false");
    typesOverflow.classList.remove("open");
});

/* Website URL */
const urlInput = document.getElementById("urlInput");
const urlCount = document.getElementById("urlCount");

urlInput.addEventListener("input", () => {
    urlCount.textContent = urlInput.value.length;
});

/* Validation helpers */
function getValidationAnchor(id) {
    if (id === "urlInput") {
        return document.querySelector("#urlMode .input-row");
    }

    if (id === "phoneInput") {
        return document.getElementById("phoneInput").closest(".phone-input");
    }

    return document.getElementById(id);
}

function getErrorElement(id) {
    let error = document.querySelector(
        `.field-error[data-error-for="${id}"]`
    );

    if (error) return error;

    const anchor = getValidationAnchor(id);
    if (!anchor) return null;

    error = document.createElement("div");
    error.className = "field-error";
    error.dataset.errorFor = id;
    anchor.insertAdjacentElement("afterend", error);

    return error;
}

function showFieldError(id, message) {
    const anchor = getValidationAnchor(id);
    const error = getErrorElement(id);

    if (anchor) anchor.classList.add("invalid-field");

    if (error) {
        error.textContent = message;
        error.classList.add("show");
    }
}

function clearFieldError(id) {
    const anchor = getValidationAnchor(id);
    const error = document.querySelector(
        `.field-error[data-error-for="${id}"]`
    );

    if (anchor) anchor.classList.remove("invalid-field");

    if (error) {
        error.classList.remove("show");
        error.textContent = "";
    }
}

function clearAllValidationErrors() {
    document.querySelectorAll(".invalid-field").forEach((element) => {
        element.classList.remove("invalid-field");
    });

    document.querySelectorAll(".field-error.show").forEach((element) => {
        element.classList.remove("show");
        element.textContent = "";
    });
}

function requiredValue(id) {
    const value = document.getElementById(id).value.trim();

    if (!value) {
        showFieldError(id, "Required field");
        return "";
    }

    clearFieldError(id);
    return value;
}

function validateHttpUrl(id) {
    const value = requiredValue(id);
    if (!value) return "";

    if (!/^https?:\/\//i.test(value)) {
        showFieldError(id, "URL must start with http:// or https://");
        return "";
    }

    try {
        new URL(value);
        clearFieldError(id);
        return value;
    } catch {
        showFieldError(id, "Enter a valid URL");
        return "";
    }
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value, minDigits, maxDigits) {
    const digitsOnly = value.replace(/\D/g, "");
    return digitsOnly.length >= minDigits &&
        digitsOnly.length <= maxDigits;
}

/* QR preview helpers */
function setPayload(payload, title) {
    currentPayload = payload;

    document.getElementById("payloadText").textContent =
        payload || "—";

    document.getElementById("previewTitle").textContent =
        title || "Ready to generate";

    document.getElementById("previewText").textContent =
        "Connect this button to your Python QR generator.";

    showToast("Content ready");
}

function renderGeneratedQR(imageUrl, altText) {
    qrPaper.innerHTML = `
        <img
            src="${imageUrl}"
            alt="${altText}"
            id="generatedQR"
            class="generated-qr"
        >
    `;
}

/* Generate website QR */
document.getElementById("generateBtn").addEventListener("click", async () => {
    const url = validateHttpUrl("urlInput");
    if (!url) return;

    try {
        const imageUrl = await requestQR(url);

        renderGeneratedQR(imageUrl, "Generated QR Code");
        setPayload(url, "Website QR");

        document.getElementById("previewTitle").textContent =
            "QR Code Ready";

        document.getElementById("previewText").textContent =
            "Scan this QR code to open the website.";

        saveHistory(url, "Website");
        currentQRImage = imageUrl;

        showToast("QR generated successfully");
    } catch (error) {
        console.error(error);
        showToast("Failed to generate QR");
    }
});

/* Generate WhatsApp QR */
document.getElementById("generateWhatsappBtn").addEventListener(
    "click",
    async () => {
        const number = requiredValue("phoneInput");
        if (!number) return;

        if (!/^\d{10}$/.test(number)) {
            showFieldError(
                "phoneInput",
                "Enter a valid 10-digit mobile number"
            );
            return;
        }

        clearFieldError("phoneInput");

        const phone = "91" + number;
        const message = encodeURIComponent(
            document.getElementById("messageInput").value.trim()
        );

        const payload =
            "https://wa.me/" +
            phone.replace(/\D/g, "") +
            (message ? "?text=" + message : "");

        try {
            const imageUrl = await requestQR(payload);

            renderGeneratedQR(imageUrl, "Generated WhatsApp QR Code");
            currentQRImage = imageUrl;
            setPayload(payload, "WhatsApp QR");

            document.getElementById("previewTitle").textContent =
                "WhatsApp QR Ready";

            document.getElementById("previewText").textContent =
                "Scan this QR code to open the WhatsApp conversation.";

            saveHistory(payload, "WhatsApp");
            showToast("WhatsApp QR generated");
        } catch (error) {
            console.error(error);
            showToast("Failed to generate QR");
        }
    }
);

function finishGeneratedQR(payload, type, altText, previewText) {
    return requestQR(payload).then((imageUrl) => {
        renderGeneratedQR(imageUrl, altText);
        currentQRImage = imageUrl;

        setPayload(payload, type + " QR");

        document.getElementById("previewTitle").textContent =
            type + " QR Ready";

        document.getElementById("previewText").textContent = previewText;

        saveHistory(payload, type);
        showToast(type + " QR generated");
    });
}

function handleGenerationError(error) {
    console.error(error);
    showToast("Failed to generate QR");
}

function encodeQuery(parameters) {
    return Object.entries(parameters)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");
}

function escapeStructuredValue(value) {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/\r?\n/g, "\\n")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,");
}

function calendarDate(value) {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? ""
        : date.toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d{3}Z$/, "Z");
}

/* Email QR */
document.getElementById("generateEmailBtn").addEventListener("click", () => {
    const address = requiredValue("emailAddress");
    if (!address) return;

    if (!isValidEmail(address)) {
        showFieldError("emailAddress", "Enter a valid email address");
        return;
    }

    clearFieldError("emailAddress");

    const payload = "mailto:" + address + "?" + encodeQuery({
        subject: document.getElementById("emailSubject").value.trim(),
        body: document.getElementById("emailMessage").value.trim()
    });

    finishGeneratedQR(
        payload,
        "Email",
        "Generated email QR Code",
        "Scan this QR code to compose an email."
    ).catch(handleGenerationError);
});

/* SMS QR */
document.getElementById("generateSmsBtn").addEventListener("click", () => {
    const number = requiredValue("smsNumber");
    const message = document.getElementById("smsMessage").value.trim();

    if (!number) return;

    if (!/^\+?[0-9\s\-()]+$/.test(number) ||
        !isValidPhone(number, 7, 15)) {
        showFieldError("smsNumber", "Enter a valid phone number");
        return;
    }

    clearFieldError("smsNumber");

    const payload =
        "SMSTO:" + number.replace(/[^\d+]/g, "") + ":" + message;

    finishGeneratedQR(
        payload,
        "SMS",
        "Generated SMS QR Code",
        "Scan this QR code to compose an SMS."
    ).catch(handleGenerationError);
});

/* Wi-Fi QR */
document.getElementById("generateWifiBtn").addEventListener("click", () => {
    const name = requiredValue("wifiName");
    const security = document.getElementById("wifiSecurity").value;
    const password = document.getElementById("wifiPassword").value.trim();

    if (!name) return;
    clearFieldError("wifiName");

    if (security !== "nopass" && !password) {
        showFieldError("wifiPassword", "Required field");
        return;
    }

    clearFieldError("wifiPassword");

    const payload =
        `WIFI:T:${security};S:${escapeStructuredValue(name)};P:${escapeStructuredValue(password)};;`;

    finishGeneratedQR(
        payload,
        "Wi-Fi",
        "Generated Wi-Fi QR Code",
        "Scan this QR code to connect to the Wi-Fi network."
    ).catch(handleGenerationError);
});

/* Contact QR */
document.getElementById("generateContactBtn").addEventListener("click", () => {
    const name = requiredValue("contactName");
    if (!name) return;

    clearFieldError("contactName");

    const contactEmail =
        document.getElementById("contactEmail").value.trim();

    const contactPhone =
        document.getElementById("contactPhone").value.trim();

    const contactWebsite =
        document.getElementById("contactWebsite").value.trim();

    if (contactEmail && !isValidEmail(contactEmail)) {
        showFieldError("contactEmail", "Enter a valid email address");
        return;
    }
    clearFieldError("contactEmail");

    if (contactPhone &&
        (!/^\+?[0-9\s\-()]+$/.test(contactPhone) ||
            !isValidPhone(contactPhone, 7, 15))) {
        showFieldError("contactPhone", "Enter a valid phone number");
        return;
    }
    clearFieldError("contactPhone");

    if (contactWebsite) {
        if (!/^https?:\/\//i.test(contactWebsite)) {
            showFieldError(
                "contactWebsite",
                "URL must start with http:// or https://"
            );
            return;
        }

        try {
            new URL(contactWebsite);
            clearFieldError("contactWebsite");
        } catch {
            showFieldError("contactWebsite", "Enter a valid URL");
            return;
        }
    } else {
        clearFieldError("contactWebsite");
    }

    const payload = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "FN:" + escapeStructuredValue(name),
        "TEL:" + escapeStructuredValue(contactPhone),
        "EMAIL:" + escapeStructuredValue(contactEmail),
        "ORG:" + escapeStructuredValue(
            document.getElementById("contactOrganization").value.trim()
        ),
        "URL:" + escapeStructuredValue(contactWebsite),
        "END:VCARD"
    ].join("\r\n");

    finishGeneratedQR(
        payload,
        "Contact",
        "Generated contact QR Code",
        "Scan this QR code to save the contact."
    ).catch(handleGenerationError);
});

/* Calendar QR */
document.getElementById("generateCalendarBtn").addEventListener("click", () => {
    const title = requiredValue("calendarTitle");
    const startValue = requiredValue("calendarStart");
    const endValue = requiredValue("calendarEnd");

    if (!title || !startValue || !endValue) return;

    clearFieldError("calendarTitle");
    clearFieldError("calendarStart");
    clearFieldError("calendarEnd");

    const start = calendarDate(startValue);
    const end = calendarDate(endValue);

    if (!start || !end || new Date(endValue) <= new Date(startValue)) {
        showFieldError("calendarEnd", "End time must be after start time");
        return;
    }

    clearFieldError("calendarEnd");

    const payload = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//QR Studio//EN",
        "BEGIN:VEVENT",
        "SUMMARY:" + escapeStructuredValue(title),
        "DTSTART:" + start,
        "DTEND:" + end,
        "LOCATION:" + escapeStructuredValue(
            document.getElementById("calendarLocation").value.trim()
        ),
        "DESCRIPTION:" + escapeStructuredValue(
            document.getElementById("calendarDescription").value.trim()
        ),
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    finishGeneratedQR(
        payload,
        "Calendar",
        "Generated calendar event QR Code",
        "Scan this QR code to add the event to your calendar."
    ).catch(handleGenerationError);
});

/* Download QR image */
document.getElementById("downloadBtn").addEventListener("click", () => {
    if (!currentQRImage) {
        showToast("Generate a QR code first");
        return;
    }

    const link = document.createElement("a");
    link.href = currentQRImage;
    link.download = "qr-code.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("QR downloaded");
});

/* Copy QR image */
document.getElementById("copyImageBtn").addEventListener(
    "click",
    async () => {
        if (!currentQRImage) {
            showToast("Generate a QR code first");
            return;
        }

        try {
            const response = await fetch(currentQRImage);
            const blob = await response.blob();

            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob
                })
            ]);

            showToast("QR image copied");
        } catch (error) {
            console.error(error);
            showToast("Copy image failed");
        }
    }
);

/* Input validation */
const phoneInput = document.getElementById("phoneInput");

const validationFieldIds = [
    "urlInput",
    "phoneInput",
    "emailAddress",
    "smsNumber",
    "wifiName",
    "wifiPassword",
    "contactName",
    "contactPhone",
    "contactEmail",
    "contactWebsite",
    "calendarTitle",
    "calendarStart",
    "calendarEnd"
];

phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
});

validationFieldIds.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;

    const eventName =
        element.tagName === "SELECT" ? "change" : "input";

    element.addEventListener(eventName, () => {
        clearFieldError(id);

        if (id === "calendarStart" || id === "calendarEnd") {
            clearFieldError("calendarEnd");
        }
    });
});

document.getElementById("wifiSecurity").addEventListener("change", () => {
    if (document.getElementById("wifiSecurity").value === "nopass") {
        clearFieldError("wifiPassword");
    }
});

/* Paste URL */
document.getElementById("pasteBtn").addEventListener("click", async () => {
    try {
        const text = await navigator.clipboard.readText();

        if (text) {
            urlInput.value = text;
            urlCount.textContent = text.length;
            clearFieldError("urlInput");
            showToast("URL pasted");
        }
    } catch {
        showToast("Use Ctrl + V to paste");
    }
});

/* Customization panel */
document.getElementById("customizeHead").addEventListener("click", () => {
    document.getElementById("customize").classList.toggle("open");
});

const fgColor = document.getElementById("fgColor");
const bgColor = document.getElementById("bgColor");

fgColor.addEventListener("input", () => {
    document.getElementById("fgHex").textContent =
        fgColor.value.toUpperCase();
});

bgColor.addEventListener("input", () => {
    document.getElementById("bgHex").textContent =
        bgColor.value.toUpperCase();
});

/* Copy encoded content */
document.getElementById("copyPayload").addEventListener("click", async () => {
    if (!currentPayload) {
        showToast("Nothing to copy");
        return;
    }

    try {
        await navigator.clipboard.writeText(currentPayload);
        showToast("Content copied");
    } catch {
        showToast("Copy failed");
    }
});

/* QR history */
let history = JSON.parse(localStorage.getItem("qr-history") || "[]")
    .filter((item) => item.type !== "Text");

localStorage.setItem("qr-history", JSON.stringify(history));

function saveHistory(payload, type) {
    history = history.filter((item) => item.payload !== payload);

    history.unshift({
        payload,
        type,
        time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    });

    history = history.slice(0, 12);

    localStorage.setItem("qr-history", JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById("historyList");

    if (!history.length) {
        list.innerHTML =
            '<div class="subtitle" style="text-align:center;margin-top:30px">No recent QR codes.</div>';
        return;
    }

    list.innerHTML = history.map((item) => `
        <div class="history-item">
            <small>${escapeHtml(item.type)} · ${escapeHtml(item.time)}</small>
            <div>${escapeHtml(item.payload)}</div>
        </div>
    `).join("");
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}

renderHistory();

document.getElementById("historyBtn").addEventListener("click", () => {
    document.getElementById("historyPanel").classList.add("open");
});

document.getElementById("closeHistory").addEventListener("click", () => {
    document.getElementById("historyPanel").classList.remove("open");
});

document.getElementById("clearHistory").addEventListener("click", () => {
    history = [];
    localStorage.removeItem("qr-history");
    renderHistory();
    showToast("History cleared");
});

/* Toast notification */
let toastTimer;

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}

/* Send QR request to Streamlit's Python component */
function requestQR(content) {
    return new Promise((resolve, reject) => {
        function finish(logo) {
            const nonce =
                String(Date.now()) + Math.random().toString(16).slice(2);

            window.__qrPending = {
                nonce,
                resolve,
                reject
            };

            sendDataToPython({
                action: "generate",
                nonce,
                content,
                foreground: document.getElementById("fgColor").value,
                background: document.getElementById("bgColor").value,
                dot_style: document.getElementById("dotStyle").value,
                logo: logo || ""
            });
        }

        const logoFile = logoInput.files[0];

        if (!logoFile) {
            finish("");
            return;
        }

        const reader = new FileReader();

        reader.onload = () => finish(String(reader.result || ""));
        reader.onerror = () => reject(new Error("QR generation failed"));

        reader.readAsDataURL(logoFile);
    });
}

function applyQRResponse(args) {
    const response = args && args.qr_response;
    const pending = window.__qrPending;

    if (!response || !pending || response.nonce !== pending.nonce) {
        return;
    }

    window.__qrPending = null;

    if (!response.ok) {
        pending.reject(
            new Error(response.error || "QR generation failed")
        );
        return;
    }

    pending.resolve(response.image);
}

function sendMessageToStreamlitClient(type, data) {
    const outData = Object.assign({
        isStreamlitMessage: true,
        type
    }, data);

    window.parent.postMessage(outData, "*");
}

function sendDataToPython(data) {
    sendMessageToStreamlitClient("streamlit:setComponentValue", {
        value: data,
        dataType: "json"
    });
}

window.addEventListener("message", (event) => {
    if (!event.data || event.data.type !== "streamlit:render") {
        return;
    }

    applyQRResponse(event.data.args || {});
});

sendMessageToStreamlitClient("streamlit:componentReady", {
    apiVersion: 1
});