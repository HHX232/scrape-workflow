'use client'

import { TaskParam } from '@/types/TaskType'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UploadIcon, XIcon, FileIcon } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

export default function FileParam({
  param,
  value,
  updateNodeParamValue,
  disabled
}: {
  param: TaskParam
  value: string
  updateNodeParamValue: (value: string) => void
  disabled?: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string>('')
  const [fileSize, setFileSize] = useState<string>('')

  // Определяем источник файла при загрузке
  useEffect(() => {
    if (value && value.startsWith('data:')) {
      // Извлекаем имя файла из base64 если оно было сохранено
      const matches = value.match(/name=([^;]+)/)
      if (matches) {
        setFileName(decodeURIComponent(matches[1]))
      } else {
        setFileName('Uploaded file')
      }
    }
  }, [value])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64String = event.target?.result as string
      // Добавляем метаданные о файле в base64 строку
      const dataUrl = base64String.replace(
        /^data:([^;]+);/,
        `data:$1;name=${encodeURIComponent(file.name)};`
      )
      updateNodeParamValue(dataUrl)
      setFileName(file.name)
      setFileSize(formatFileSize(file.size))
    }
    reader.readAsDataURL(file)
  }

  const handleClearFile = () => {
    updateNodeParamValue('')
    setFileName('')
    setFileSize('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const isFileUploaded = value && value.startsWith('data:')
  const isConnectedFile = value && !value.startsWith('data:') // Файл из другого блока

  return (
    <div className="w-full space-y-2">
      <Label htmlFor={param.name} className="text-xs flex items-center justify-between">
        <span className="flex items-center gap-1">
          {param.name}
          {param.required && <span className="text-destructive">*</span>}
        </span>
      </Label>

      <Input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
        onChange={handleFileUpload}
        disabled={disabled}
        className="hidden"
        id={`file-${param.name}`}
      />

      {!value ? (
        // Нет файла - показываем кнопку загрузки
        <>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <UploadIcon className="w-4 h-4 mr-2" />
            Choose File
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Upload a file or connect from previous block
          </p>
        </>
      ) : isFileUploaded ? (
        // Загруженный локальный файл
        <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
          <FileIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{fileName}</p>
            {fileSize && (
              <p className="text-xs text-muted-foreground">{fileSize}</p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={handleClearFile}
            disabled={disabled}
          >
            <XIcon className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        // Файл из другого блока (через connection)
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
          <FileIcon className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-green-900 dark:text-green-100">
              File from previous block
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Connected via workflow
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={handleClearFile}
            disabled={disabled}
          >
            <XIcon className="w-3 h-3" />
          </Button>
        </div>
      )}

      {param.helperText && (
        <p className="text-xs text-muted-foreground">{param.helperText}</p>
      )}

      {!value && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Supported formats:</p>
          <p>PDF, DOC, DOCX, TXT, CSV, XLSX, XLS</p>
        </div>
      )}
    </div>
  )
}