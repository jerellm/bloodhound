// import function that calls USPS API from module.js
//import { getTracking, findTracking, ups, fedex } from 'ts-tracking-number';

const electron = require('electron');
const url = require('url');
const path = require('path');

// imports functions for validating input
const { getTracking, findTracking, amazon, dhl, fedex, ups, usps }
	= require('ts-tracking-number');

//trying delivery-tracker package
//const tracker = require('delivery-tracker');
//const courier = tracker.courier(tracker.COURIER.USPS.CODE);

process.env.NODE_ENV = 'development';

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;
// Listen for app to be ready
app.on('ready', function(){
	// Create new window
	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		}
	});
	// Load html into window
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'mainWindow.html'),
		protocol:'file:',
		slashes: true
	}));
	// Quit app when closed
	mainWindow.on('closed', function(){
		app.quit();
	});
	// Build menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	// Insert menu
	Menu.setApplicationMenu(mainMenu);
});

// Handle add item window
function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 300,
    height:200,
    title:'Add Shopping List Item',
		webPreferences: {
			nodeIntegration: true
		}

  });
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Handle garbage collection
  addWindow.on('close', function(){
    addWindow = null;
  });
}

// Catch item:add
ipcMain.on('item:add', function(e, item){

	// verify tracking number here and send location to mainWindow
	//const tracking = findTracking(item);
	var result;
	courier.trace({item}, function(err, result));
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
  // Still have a reference to addWindow in memory. Need to reclaim memory (Grabage collection)
  //addWindow = null;
});
// Create menu template
const mainMenuTemplate = [
	{
		label:'File',
		submenu:[
			{
				label: 'Add Item',
				click(){
					createAddWindow();
				}
			},
			{
				label: 'Clear Items',
				click(){
					mainWindow.webContents.send('item:clear');
				}
			},
			{
				label: 'Quit',
				// Add keyboard shortcuts for Mac and Windows/Linux
				accelerator: process.platform == 'darwin' ? 'Command+Q' :
				'Ctrl+Q',
				click(){app.quit();
				}
			}
		]
	}
];

// If Mac add empty object to menu
if(process.platform == 'darwin'){
	mainMenuTemplate.unshift({});
}

// Add developer tools if not in prodution
if(process.env.NODE_ENV !== 'production'){
	mainMenuTemplate.push({
		label: 'Developer tools',
		submenu:[
			{
				label: 'Toggle DevTools',
				accelerator: process.platform == 'darwin' ? 'Command+I' :
				'Ctrl+I',
				click(item, focusedWindow){
					focusedWindow.toggleDevTools();
				}
			},
			{
				role: 'reload'
			}
		]
	});
}
// Test change
