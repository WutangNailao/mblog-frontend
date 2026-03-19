export interface UploadFileInfo {
  file?: File
}

export interface UploadCustomRequestOptions {
  file: UploadFileInfo
}

export interface UploadInst {
  clear: () => void
}
