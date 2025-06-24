/**
 * swosh index - by æ’’
 */

const
    { app, BrowserWindow } = require('electron'),
    path = require('path'),
    url = require('url'),
    { autoUpdater } = require('electron-updater'),
    { createProtocol } = require('vue-cli-plugin-electron-builder/lib'),
    isDevelopment = process.env.NODE_ENV !== 'production';
    
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.