// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2601-FTB-CT-WEB-PT"; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

function deleteParty(id) {
  const $button = document.createElement("button");
  $button.classList.add("deleteButton");
  $button.textContent = "Delete Party";

  $button.addEventListener("click", async () => {
    try {
      console.log("id", id);
      console.log(API + "/events/" + id);
      await fetch(API + "/events/" + id, {
        method: "DELETE",
      });

      parties = parties.filter((party) => party.id !== id); // update local state and delete selected party (by id) from parties array

      if (selectedParty?.id === id) { // checks if currently viewed party has been deleted
        selectedParty = null;
      }

      render();
    } catch (error) {
      console.error(error);
    }
  });

  return $button;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <DeleteButton></DeleteButton>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());
  $party.querySelector("DeleteButton").replaceWith(deleteParty(selectedParty.id));

  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

async function addParty(partyData) {
  const response = await fetch(API + "/events", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(partyData),
  });

  const result = await response.json();
  return result.data;
}


function partyForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `
    <label>
      Name
      <input name="name" required />
    </label>
    <label>
      Description
      <input name="description" required />
    </label>
    <label>
      Date
      <input name="date" type="date"/>
    </label>
    <label>
      Location
      <input name="location" required />
    </label>
    <button type="submit">Add Party</button>
  `;

  $form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData($form);

    const dateFromForm = formData.get("date");
    const isoDate = new Date(dateFromForm).toISOString();
    
    const newParty = {
      name: formData.get("name"),
      description: formData.get("description"),
      date: isoDate,
      location: formData.get("location"), 
    };

    const createdParty = await addParty(newParty);

    parties.push(createdParty);
    render();
  });

  return $form;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
        <h3>Add a New Party</h3>
        <PartyForm></PartyForm>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
  $app.querySelector("PartyForm").replaceWith(partyForm());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();