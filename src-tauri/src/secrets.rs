use keyring::Entry;

#[tauri::command]
pub fn secret_get(service: String, account: String) -> Result<Option<String>, String> {
  let entry = Entry::new(&service, &account).map_err(|e| e.to_string())?;
  match entry.get_password() {
    Ok(p) => Ok(Some(p)),
    Err(keyring::Error::NoEntry) => Ok(None),
    Err(e) => Err(e.to_string()),
  }
}

#[tauri::command]
pub fn secret_set(service: String, account: String, password: String) -> Result<(), String> {
  let entry = Entry::new(&service, &account).map_err(|e| e.to_string())?;
  entry.set_password(&password).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn secret_delete(service: String, account: String) -> Result<(), String> {
  let entry = Entry::new(&service, &account).map_err(|e| e.to_string())?;
  match entry.delete_credential() {
    Ok(_) => Ok(()),
    Err(keyring::Error::NoEntry) => Ok(()),
    Err(e) => Err(e.to_string()),
  }
}
