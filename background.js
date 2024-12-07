chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleSelection") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          const tabId = tabs[0].id;
  
          chrome.scripting.executeScript(
            {
              target: { tabId: tabId },
              func: toggleElementSelection,
              args: [request.enabled],
            },
            () => {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
              } else {
                
              }
            }
          );
        }
      });
    } else if (request.action === "elementSelected") {
      const { xpath, url } = request;
      
  
      // Save XPath and URL to local storage
      chrome.storage.local.set({ xpath, url }, () => {
        
      });
    }
  });
  
  function toggleElementSelection(enabled) {
    if (enabled) {
      
      document.body.style.cursor = "crosshair";
  
      function handleClick(event) {
        event.preventDefault();
        event.stopPropagation();
  
        const clickedElement = event.target;
        const xpath = getXPath(clickedElement);
        const url = window.location.href;
  
        
        
  
        chrome.runtime.sendMessage({
          action: "elementSelected",
          xpath: xpath,
          url: url,
        });
  
        // Optionally, visually mark the selected element
        clickedElement.style.filter = "brightness(0.8) contrast(1.2)"; 
        // Disable the selection after clicking
        toggleElementSelection(false);
      }
  
      function getXPath(element) {
        if (element.id) return `//*[@id="${element.id}"]`;
        const parts = [];
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
          parts.unshift(part);
          element = element.parentNode;
        }
        return `/${parts.join("/")}`;
      }
  
      // Attach click event listener
      document.addEventListener("click", handleClick, true);
  
      // Store reference to cleanup function
      window.__handleClick = handleClick;
    } else {
      
      document.body.style.cursor = "default";
  
      // Remove event listener if it exists
      if (window.__handleClick) {
        document.removeEventListener("click", window.__handleClick, true);
        delete window.__handleClick;
      }
    }
  }
  