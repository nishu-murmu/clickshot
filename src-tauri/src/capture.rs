use crate::utils;
use xcap::Monitor;

pub fn capture_fullscreen_shot(name: String) -> Option<String> {
    let monitors = Monitor::all().unwrap();
    if let Some(username) = utils::get_user_name() {
        if let Some(primary) = monitors.first() {
            let path = format!("/home/{username}/Pictures/Screenshots/{name}.png");
            primary.capture_image().unwrap().save(&path).unwrap();
            return Some(path);
        }
    }
    None
}

pub fn capture_region_shot(name: String, x: u32, y: u32, width: u32, height: u32) -> Option<String> {
    let monitors = Monitor::all().unwrap();
    if let Some(username) = utils::get_user_name() {
        if let Some(primary) = monitors.first() {
            let path = format!("/home/{username}/Pictures/Screenshots/{name}.png");
            primary
                .capture_region(x, y, width, height)
                .unwrap()
                .save(&path)
                .unwrap();
            return Some(path);
        }
    }
    None
}
