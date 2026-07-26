/*
  GOOGLE CALENDAR SETUP
  ---------------------
  After creating the "Free Commercial Cleaning Walkthrough" appointment schedule:
  Google Calendar -> Booking pages -> Options -> Sharing options -> Website embed
  -> A single booking page -> Inline booking page -> Copy code.

  Copy only the URL from the iframe's src="..." and paste it between the quotation marks below.
*/
const GOOGLE_CALENDAR_BOOKING_URL = "https://calendar.google.com/appointments/schedules/AcZssZ1fMzj4XxUF-mb0xfKrXAucb7ewb6Y3YXQknHpyF_KqLURYlcZSNXCy7s2oix2Cxd81KK6mp7sA";

const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector("#site-menu");

menuButton?.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

const quoteForm = document.querySelector("#quote-request-form");
const formStatus = document.querySelector("#form-status");
const servicesError = document.querySelector("#services-error");
const squareFootageKnown = document.querySelector("#square-footage-known");
const exactSquareFootageField = document.querySelector("#exact-square-footage-field");
const squareFootageRangeField = document.querySelector("#square-footage-range-field");
const exactSquareFootageInput = quoteForm?.querySelector('[name="exactSquareFootage"]');
const squareFootageRangeSelect = quoteForm?.querySelector('[name="squareFootageRange"]');

const cleanValue = (value) => String(value || "").trim();

const updateSquareFootageFields = () => {
  if (!squareFootageKnown) return;

  const answer = squareFootageKnown.value;
  const knowsExact = answer === "Yes";
  const needsRange = answer === "No" || answer === "Not sure";

  exactSquareFootageField?.classList.toggle("is-hidden", !knowsExact);
  squareFootageRangeField?.classList.toggle("is-hidden", !needsRange);

  if (exactSquareFootageInput) {
    exactSquareFootageInput.required = knowsExact;
    exactSquareFootageInput.disabled = !knowsExact;
    if (!knowsExact) exactSquareFootageInput.value = "";
  }

  if (squareFootageRangeSelect) {
    squareFootageRangeSelect.required = needsRange;
    squareFootageRangeSelect.disabled = !needsRange;
    if (!needsRange) squareFootageRangeSelect.value = "";
  }
};

squareFootageKnown?.addEventListener("change", updateSquareFootageFields);
updateSquareFootageFields();

quoteForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedServices = [...quoteForm.querySelectorAll('input[name="services"]:checked')]
    .map((input) => input.value);
  const selectedAddons = [...quoteForm.querySelectorAll('input[name="addons"]:checked')]
    .map((input) => input.value);

  if (selectedServices.length === 0) {
    servicesError.textContent = "Please select at least one requested service.";
    quoteForm.querySelector('input[name="services"]')?.focus();
  } else {
    servicesError.textContent = "";
  }

  if (!quoteForm.checkValidity() || selectedServices.length === 0) {
    quoteForm.reportValidity();
    formStatus.textContent = "Please complete the required fields before sending your request.";
    return;
  }

  const data = new FormData(quoteForm);
  const customerName = cleanValue(data.get("customerName"));
  const companyName = cleanValue(data.get("companyName"));
  const subject = `Commercial Cleaning Quote Request — ${companyName || customerName}`;
  const squareFootageAnswer = cleanValue(data.get("squareFootageKnown"));
  const exactSquareFootage = cleanValue(data.get("exactSquareFootage"));
  const squareFootageRange = cleanValue(data.get("squareFootageRange"));

  let squareFootageSummary = "Not provided";
  if (squareFootageAnswer === "Yes" && exactSquareFootage) {
    squareFootageSummary = `${Number(exactSquareFootage).toLocaleString()} sq. ft. (exact figure provided by customer)`;
  } else if (squareFootageRange) {
    squareFootageSummary = `${squareFootageRange} (estimated range)`;
  }

  const lines = [
    "NEW COMMERCIAL CLEANING QUOTE REQUEST",
    "",
    `Customer name: ${customerName}`,
    `Company name: ${companyName}`,
    `Phone number: ${cleanValue(data.get("phone"))}`,
    `Email: ${cleanValue(data.get("email"))}`,
    `Property address or ZIP code: ${cleanValue(data.get("propertyLocation"))}`,
    `Type of facility: ${cleanValue(data.get("facilityType"))}`,
    `Knows exact square footage: ${squareFootageAnswer}`,
    `Square footage: ${squareFootageSummary}`,
    `Number of restrooms: ${cleanValue(data.get("restrooms")) || "Not provided"}`,
    `Cleaning frequency needed: ${cleanValue(data.get("frequency"))}`,
    `Preferred service timing: ${cleanValue(data.get("serviceTiming"))}`,
    `Preferred cleaning days and times: ${cleanValue(data.get("preferredSchedule"))}`,
    `Current condition of the property: ${cleanValue(data.get("propertyCondition"))}`,
    `Cleaning service requested: ${selectedServices.join(", ")}`,
    `Optional add-ons: ${selectedAddons.length ? selectedAddons.join(", ") : "None selected"}`,
    `Preferred walkthrough date: ${cleanValue(data.get("walkthroughDate")) || "Not provided"}`,
    "",
    "Additional details:",
    cleanValue(data.get("additionalDetails")) || "None provided",
    "",
    "Submitted through the Swipe Right Cleaning LLC website."
  ];

  const body = lines.join("\n");
  const mailtoUrl = `mailto:quotes@swiperightcleaningllc.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  formStatus.textContent = "Opening your email app. Review the prepared message and press Send to complete your request.";

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(body).catch(() => {});
  }

  window.location.href = mailtoUrl;
});

quoteForm?.querySelectorAll('input[name="services"]').forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (quoteForm.querySelector('input[name="services"]:checked')) {
      servicesError.textContent = "";
    }
  });
});

const calendarFrame = document.querySelector("#calendar-booking-frame");
const calendarPlaceholder = document.querySelector("#calendar-placeholder");
const calendarOpenLink = document.querySelector("#calendar-open-link");

if (calendarFrame && GOOGLE_CALENDAR_BOOKING_URL.trim()) {
  const bookingUrl = GOOGLE_CALENDAR_BOOKING_URL.trim();
  calendarFrame.src = bookingUrl;
  calendarFrame.classList.add("is-connected");
  calendarPlaceholder?.classList.add("is-hidden");

  if (calendarOpenLink) {
    calendarOpenLink.href = bookingUrl;
    calendarOpenLink.classList.remove("is-hidden");
  }
}

const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = new Date().getFullYear();
