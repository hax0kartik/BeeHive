// Learn more about Tauri commands at https://v2.tauri.app/develop/calling-rust/

use forensic_rs::prelude::*;
use frnsc_hive::reader::HiveRegistryReader;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn hivereader(filepath: &str) -> String {
    let fs = Box::new(forensic_rs::core::fs::ChRootFileSystem::new(filepath, Box::new(forensic_rs::core::fs::StdVirtualFS::new())));
    let reader = HiveRegistryReader::new().from_fs(fs).unwrap();
    let user_names_key = reader.open_key(HKLM, r"SAM\Domains\Account\Users\Names").expect("Should list all user names");
    let users = reader.enumerate_keys(user_names_key).expect("Should enumerate users");

    println!("Users: {:?}", users);
    assert_eq!("Administrador", users[0]);
    assert_eq!("DefaultAccount", users[1]);
    assert_eq!("Invitado", users[2]);
    assert_eq!("maria.feliz.secret", users[3]);
    assert_eq!("pepe.contento.secret", users[4]);
    assert_eq!("SuperSecretAdmin", users[5]);
    format!("Users: {:?}", users)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, hivereader])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
