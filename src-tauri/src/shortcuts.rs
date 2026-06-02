use crate::utils;

pub fn init(app: &tauri::App) {
    use tauri_plugin_global_shortcut::{
        Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
    };

    let ctrl_s_shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::KeyS);

    app.handle()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    println!("{:?}", shortcut);
                    if shortcut == &ctrl_s_shortcut {
                        match event.state() {
                            ShortcutState::Pressed => {
                                utils::open_overlay(app);
                            }
                            ShortcutState::Released => {
                                println!("Ctrl+S released!");
                            }
                        }
                    }
                })
                .build(),
        )
        .unwrap();

    app.global_shortcut().register(ctrl_s_shortcut).unwrap();
}
