type MaybePromise<T> = T | Promise<T>

export interface FormItemRule {
  required?: boolean
  min?: number
  max?: number
  message?: string
  trigger?: string[]
  validator?: (rule: FormItemRule, value: any) => boolean | Error | MaybePromise<boolean | Error>
}

export type FormRules = Record<string, FormItemRule[]>

export interface FormInst {
  validate: (callback?: (errors: string[] | null) => void) => Promise<string[] | null>
}
