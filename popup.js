const toggleCheckbox = document.getElementById("toggle-selection");
const messageInput = document.getElementById("message-input");
const submitButton = document.getElementById("submit-button");
const scanButton = document.getElementById("scan-button");
const helpButton = document.getElementById("help-button");
helpButton.style.display = "none"; //i'm stup[id]
// Disable the message input by default
messageInput.disabled = true;
submitButton.disabled = true;
// Update the state of the message input based on stored data
function updateInputState() {
  chrome.storage.local.get(["xpath"], (data) => {
    if (data.xpath) {
      messageInput.disabled = false;
      submitButton.disabled = false;
      
    } else {
      messageInput.disabled = true;
      submitButton.disabled = true;
      
    }
  });
}

// Handle toggle selection
toggleCheckbox.addEventListener("change", (event) => {
  const enabled = event.target.checked;
  chrome.runtime.sendMessage({ action: "toggleSelection", enabled: enabled });
});
helpButton.addEventListener("click", () => {
  const newWindow = window.open("", "_blank", "width=500,height=400");
          if (newWindow) {
            newWindow.document.write(``);
            newWindow.document.title = "Enigmatica Guide";
          } else {
            alert("Unable to open a new window.");
          }
});

// Handle message submission
submitButton.addEventListener("click", () => {
  chrome.storage.local.get(["xpath", "url"], (data) => {
    if (data.xpath && data.url) {
      const message = messageInput.value;
      

      // Mock sending the data (replace this with actual API call later)
      fetch("https://fij6n5uqf1.execute-api.eu-central-1.amazonaws.com/Prod", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, message }),
      })
        .then((response) => {
          if (response.ok) {
            
            ClearPopup("Message Enscribed.");
          } else {
            console.error("Failed to submit message:", response.statusText);
            ClearPopup("Enscription Failure.");
          }
        })
        .catch((error) => {
          ClearPopup("Enscription Failure.");
          console.error("Error submitting message:", error);
        });


      
    } else {
      console.error("No element selected. Cannot submit message.");
    }
  });
});

// Handle scanning for elements
scanButton.addEventListener("click", () => {
  chrome.storage.local.get(["url"], (data) => {
    if (!data.url) {
      console.error("No URL available to scan.");
      return;
    }
fetch("https://fij6n5uqf1.execute-api.eu-central-1.amazonaws.com/Prod", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ url: data.url })
})
.then(response => response.json())
.then(data => {
    // Send the scan data to the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;

        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            func: appendMessageButtons,
            args: [JSON.parse(data.body).items],
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
            }
          }
        );
      }
    });

});
});
})
   

// Update the message input state when the popup is opened
updateInputState();

// Function to append buttons to the page (injected into the webpage)
function appendMessageButtons(scanData) {
    scanData.forEach((item) => {
      const { xpath, message } = item;
  
      const element = getElementByXPath(xpath);
      if (element) {
        const button = document.createElement("button");
        button.textContent = "Decipher";
        button.style.position = "absolute";
        button.style.opacity = 0.65;
        button.style.zIndex = 9999;
        button.style.background = "yellow";
        button.style.border = "1px solid black";
        button.style.cursor = "pointer";
  
        // Position the button in the top-left corner of the element
        const rect = element.getBoundingClientRect();
        button.style.top = `${window.scrollY + rect.top}px`;
        button.style.left = `${window.scrollX + rect.left}px`;
  
        // Attach click event to open a new window with the message
        button.addEventListener("click", () => {
          const newWindow = window.open("", "_blank", "width=500,height=400");
          if (newWindow) {
            newWindow.document.write(message);
            newWindow.document.title = "Message";
          } else {
            alert("Unable to open a new window.");
          }
        });
  
        // Append the button to the body
        document.body.appendChild(button);
      }
    });
  
    function getElementByXPath(xpath) {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue;
    }
  }
  function ClearPopup(message) {
    document.body.innerHTML = '';
    const h1 = document.createElement('h1');
    h1.classList.add('centered');
    h1.textContent = message;
    document.body.appendChild(h1);
  }