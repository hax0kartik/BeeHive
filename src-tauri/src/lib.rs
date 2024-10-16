// Learn more about Tauri commands at https://v2.tauri.app/develop/calling-rust/

use forensic_rs::prelude::*;
use frnsc_hive::reader::HiveRegistryReader;
use frnsc_hive::reader::open_hive_with_logs;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

pub fn from_fs_custom(mut reader: HiveRegistryReader, mut fs: Box<dyn VirtualFileSystem>) -> ForensicResult<Box<dyn RegistryReader>> {
    let config_folder = std::path::Path::new(".\\");
    if let Some(hive) = open_hive_with_logs(&mut fs, config_folder, "SYSTEM") {
        reader.set_system(hive);
    }
    if let Some(hive) = open_hive_with_logs(&mut fs, config_folder, "SOFTWARE") {
        reader.set_software(hive);
    }
    if let Some(hive) = open_hive_with_logs(&mut fs, config_folder, "SECURITY") {
        reader.set_security(hive);
    }
    if let Some(hive) = open_hive_with_logs(&mut fs, config_folder, "SAM") {
        reader.set_sam(hive);
    }
    match reader.load_user_hives(&mut fs) {
        Ok(_) => {}
        Err(e) => {
            notify_low!(
                NotificationType::Informational,
                "Error loading user hives: {:?}",
                e
            );
        }
    };
    Ok(Box::new(reader))
}

#[tauri::command]
fn hivereader(filepath: &str) -> String {
    let fs = Box::new(forensic_rs::core::fs::ChRootFileSystem::new(filepath, Box::new(forensic_rs::core::fs::StdVirtualFS::new())));
    let hreader = HiveRegistryReader::new();
    let reader = from_fs_custom(hreader, fs).unwrap();
    let res = reader.open_key(HKLM, r"SAM\Domains\Account\Users\Names");
    
    if res.is_err() {
        println!("Hive file not found! {:?}", res.err());
        return "Error Occured!".to_string();
    }

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
