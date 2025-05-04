`use strict`;

// State variables for DOM elements
const characterDropdown = document.getElementById(`character-dropdown`);
const teammatesDropdown = document.getElementById("teammates-dropdown");
const resultField = document.getElementById(`result`);
const submitButton = document.getElementById(`submit-btn`);
const clearAllButton = document.getElementById(`clear-all`);

// Median substat values used as reference points for calculation
const medianSubs = {
  Crit: 8.1,
  CritDmg: 16.2,
  ER: 9.2,
  Attack: 8.6,
  FlatATK: 50,
  Normal: 8.6,
  Heavy: 8.6,
  Skill: 8.6,
  Liberation: 8.6,
  Health: 8.6,
  FlatHP: 50,
  Defense: 8.6,
  FlatDef: 50,
};

// Load and parse CSV on page load
document.addEventListener("DOMContentLoaded", () => {
  fetch("presets.csv")
    .then((response) => response.text())
    .then((data) => {
      // Parse CSV
      const rows = data.trim().split("\n");
      const headers = rows[0].split(",");

      // Convert rows to objects
      presetData = rows.slice(1).map((row) => {
        const values = row.split(",");
        return headers.reduce((obj, header, i) => {
          obj[header.trim()] = values[i].trim();
          return obj;
        }, {});
      });

      // Populate character dropdown
      const characters = [...new Set(presetData.map((row) => row.Character))];
      characters.forEach((char) => {
        const option = document.createElement("option");
        option.value = char;
        option.textContent = char;
        characterDropdown.appendChild(option);
      });

      // Function to populate teammates dropdown based on selected character
      const populateTeammatesDropdown = () => {
        const selectedChar = characterDropdown.value;

        // Filter rows where Character matches selected character
        const filteredRows = presetData.filter(
          (row) => row.Character === selectedChar
        );

        // Extract unique teammate combinations
        const teammates = [...new Set(filteredRows.map((row) => row.Teammates))];

        // Clear existing options in teammates dropdown
        teammatesDropdown.innerHTML = "";

        // Populate teammates dropdown
        teammates.forEach((teammate) => {
          const option = document.createElement("option");
          option.value = teammate;
          option.textContent = teammate;
          teammatesDropdown.appendChild(option);
        });

        // Select the first option in the teammates dropdown
        if (teammatesDropdown.options.length > 0) {
          teammatesDropdown.value = teammatesDropdown.options[0].value;
        }
      };

      // Populate the teammates dropdown initially on page load
      populateTeammatesDropdown();

      // Add event listener for toggle defensive stats button
      const toggleDefensiveStatsButton = document.getElementById(
        "toggle-defensive-stats"
      );
      const defensiveStatsBody = document.getElementById("defensive-stats");

      toggleDefensiveStatsButton.addEventListener("click", () => {
        defensiveStatsBody.classList.toggle("hidden");
      });

      // Add event listener for character dropdown change
      characterDropdown.addEventListener("change", populateTeammatesDropdown);
    })
    .catch((error) => console.error("Error loading CSV:", error));
});

// Event listener for submit button click
submitButton.addEventListener("click", () => {
  // Function to get the selected value from a group of radio buttons
  function getSelectedValue(name) {
    const radios = document.getElementsByName(name);
    for (let i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
        return parseFloat(radios[i].value); // Parse the value as a float
      }
    }
    return 0; // Return 0 if no option is selected
  }

  // Calculate the worth of the echo
  if (characterDropdown.value && teammatesDropdown.value) {
    let worth = 0;

    // Find the relevant preset row
    const selectedPreset = presetData.find(
      (row) =>
        row.Character === characterDropdown.value &&
        row.Teammates === teammatesDropdown.value
    );

    if (selectedPreset) {
      // List of substats to consider
      const substats = [
        "Crit",
        "CritDmg",
        "ER",
        "Attack",
        "FlatATK",
        "Normal",
        "Heavy",
        "Skill",
        "Liberation",
        "Health",
        "FlatHP",
        "Defense",
        "FlatDef",
      ];

      substats.forEach((substat) => {
        const selectedValue = getSelectedValue(substat);
        const medianValue = medianSubs[substat];
        const multiplier = parseFloat(selectedPreset[substat]); // Parse multiplier as float

        if (selectedValue > 0 && medianValue > 0) {
          worth += (selectedValue / medianValue) * multiplier;
        }
      });

      // Display the calculated worth
      resultField.textContent = `${worth.toFixed(2)}%`; // Format to 2 decimal places
    } else {
      resultField.textContent = "Preset not found.";
    }
  } else {
    resultField.textContent = "Please select character and teammates.";
  }
});

// Clear button functionality for substat forms
document.querySelectorAll('button[name$="-clear"]').forEach((button) => {
  button.addEventListener("click", () => {
    const substat = button.name.replace("-clear", "");
    const elementsToClear = document.getElementsByName(substat);
    elementsToClear.forEach((element) => {
      // Check if the element has a 'checked' property before trying to set it
      if ("checked" in element) {
        element.checked = false;
      }
    });
  });
});

// Clear all button for substat forms
clearAllButton.addEventListener("click", () => {
  resultField.textContent = "0.00%";
  const allRadioGroups = document.querySelectorAll('input[type="radio"]');
  allRadioGroups.forEach((radio) => {
    radio.checked = false;
  });
});
