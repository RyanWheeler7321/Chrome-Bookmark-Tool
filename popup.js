document.addEventListener('DOMContentLoaded', function() {
    const selectElement = document.getElementById('folderSelect');
    const openRandomButton = document.getElementById('openRandom');
    const openAllButton = document.getElementById('openAll'); // New button
	
    // Load bookmark folders into the select element
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
        loadFolders(bookmarkTreeNodes, selectElement);
        // Load the last selected folder
        chrome.storage.sync.get('lastSelectedFolder', function(items) {
            if (items.lastSelectedFolder) {
                selectElement.value = items.lastSelectedFolder;
            }
        });
    });

    openRandomButton.addEventListener('click', function() {
        const selectedFolderId = selectElement.value;
        // Save the last selected folder
        chrome.storage.sync.set({'lastSelectedFolder': selectedFolderId}, function() {
            console.log('Last selected folder saved.');
        });
        openRandomBookmark(selectedFolderId);
    });
	
    openAllButton.addEventListener('click', function() {
        const selectedFolderId = selectElement.value;
        openAllBookmarks(selectedFolderId);
    });
});

function loadFolders(nodes, selectElement, prefix = '') {
    for (let node of nodes) {
        if (node.children && node.children.length > 0) {
            // Check if the node is a folder by seeing if it has children
            let newPrefix = prefix;
            if (!isRootNode(node)) { // Only add dashes if it's not a root folder
                newPrefix += '-----';
            }
            if (node.title) {
                const option = document.createElement('option');
                option.value = node.id;
                option.text = newPrefix + node.title;
                selectElement.appendChild(option);
            }
            // Recursive call for children
            node.children.forEach(child => {
                loadFolders([child], selectElement, newPrefix);
            });
        }
    }
}

function isRootNode(node) {
    return node.parentId === '0' || node.parentId === undefined;
}



function openRandomBookmark(folderId) {
    chrome.bookmarks.getChildren(folderId, function(bookmarks) {
        const randomIndex = Math.floor(Math.random() * bookmarks.length);
        const bookmark = bookmarks[randomIndex];
        if (bookmark.url) {
            chrome.tabs.create({url: bookmark.url});
        }
    });
}

// New function to open all bookmarks in a folder
function openAllBookmarks(folderId) {
    chrome.bookmarks.getChildren(folderId, function(bookmarks) {
        bookmarks.forEach(bookmark => {
            if (bookmark.url) { // Ensure it's a bookmark with a URL
                chrome.tabs.create({url: bookmark.url, active: false}); // Opens each bookmark in a new tab
            }
        });
    });
}
