
let selecting = false;
let highlightedElement = null;

chrome.storage.local.remove("xpath", () => {
  
});
chrome.storage.local.set({ url: window.location.href }, () => {
  
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "enableSelection") {
    selecting = true;
    document.body.style.cursor = "crosshair";  // Change cursor to crosshair to show that selection is enabled
    document.addEventListener("click", handleElementClick, true);  // Enable the click handler for element selection
  } else if (request.action === "disableSelection") {
    selecting = false;
    document.body.style.cursor = "default";  // Reset the cursor when selection is disabled
    document.removeEventListener("click", handleElementClick, true);  // Disable the click handler
    if (highlightedElement) {
      highlightedElement.style.filter = "";  // Reset the highlight filter on previously selected element
      highlightedElement = null;
    }
  }
});

function handleElementClick(event) {
  event.preventDefault();  // Prevent the default behavior
  event.stopPropagation();  // Stop the event from bubbling up

  if (selecting) {
    if (highlightedElement) {
      highlightedElement.style.filter = "";  // Reset the highlight filter
    }
    highlightedElement = event.target;
    highlightedElement.style.filter = "brightness(0.8) contrast(1.2)";  // Apply the highlight filter to the selected element

    const xpath = getXPath(event.target);  // Get the XPath of the clicked element
    const currentUrl = window.location.href;  // Get the current page's URL

    // Log the XPath and the URL
    
    

    // Send the XPath and URL to the popup
    chrome.runtime.sendMessage({
      action: "elementSelected",
      xpath: xpath,
      url: currentUrl
    });

    // Disable selection after the click
    chrome.runtime.sendMessage({ action: "disableSelection" });
  }
}

// Helper function to get XPath of an element
function getXPath(element) {
  if (element.id) return `//*[@id="${element.id}"]`;
  const path = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let index = 0;
    let sibling = element.previousSibling;
    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    const tagName = element.nodeName.toLowerCase();
    const part = index ? `${tagName}[${index + 1}]` : tagName;
    path.unshift(part);
    element = element.parentNode;
  }
  return `/${path.join("/")}`;
}
