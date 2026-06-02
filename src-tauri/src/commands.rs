use crate::utils;
use tauri::Manager;

#[tauri::command]
pub fn close_overlay_command(app: tauri::AppHandle) {
    if let Some(has_overlay) = app.get_webview_window("main") {
        has_overlay.close().ok();
    }
}

#[tauri::command]
pub fn full_screenshot_command(app: tauri::AppHandle) {
    utils::full_screenshot_handler(&app);
}

#[tauri::command]
pub fn region_screenshot_command(app: tauri::AppHandle, x: u32, y: u32, width: u32, height: u32) {
    utils::region_screenshot_handler(&app, x, y, width, height);
}
