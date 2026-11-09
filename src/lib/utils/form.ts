import { AnySchema } from 'yup/lib/schema'
import { FormEventHandler, useCallback } from 'react'

/**
 * (+) 'reportType' - simple field name               -> data['reportType'] = value
 *
 * (+) { name: 'reportType', index: 2 } - array field -> data['reportType'][2] = value
 *
 * (+) { name: 'usersData', index: 2, field: 'firstName' } -> data['usersData'][2]['firstName'] = 'Bob'
 *
 * (+) { name: 'userData', field: 'firstName' } -> data['userData']['firstName'] = 'Bob'
 *
 * (+) { name: 'userData', field: { name: 'address', field: 'street' } } -> data['userData']['address']['street'] = 'Backer Street'
 */
export type FormFieldName = string | { name: string; field?: FormFieldName; index?: number }

export function setFormValue<T>(data: Record<string, any>, name: FormFieldName, value: T) {
  // { name: ...., index: 2 }
  if (name && typeof name === 'object' && typeof name.index === 'number') {
    const { name: arrayFieldName, field, index } = name
    data[arrayFieldName] = [...(data[arrayFieldName] ?? [])]

    if (field) {
      data[arrayFieldName][index] = { ...data[arrayFieldName][index] }

      setFormValue(data[arrayFieldName][index], field, value)
    } else {
      data[arrayFieldName][index] = value
    }
  } else if (name && typeof name === 'object') {
    // { name: ...., field: .... }
    const { name: objFieldName, field } = name
    data[objFieldName] = { ...data[objFieldName] }

    if (field) {
      setFormValue(data[objFieldName], field, value)
    } else {
      data[objFieldName] = value
    }
  } else if (name && typeof name === 'string') {
    // name: string | number
    data[name] = value
  }
}

export function trackFormTouch(data: Record<string, boolean | any>, name: FormFieldName) {
  setFormValue(data, name, true)
}

export function isValidForm(schema: AnySchema, data: Record<string, any>) {
  return schema.isValid(data, { abortEarly: false })
}

export type FormErrors<T> = Partial<Record<keyof T, string>>
export type FormValues<T> = Partial<T>
export type FormTouchedValues<T> = Partial<Record<keyof T, true>>

export function validateFormArray<T>(schema: AnySchema, data: FormValues<T>[]): FormErrors<T>[] {
  try {
    schema.validateSync(data, { abortEarly: false })
    return []
  } catch (err) {
    return err.inner.reduce((res, x) => {
      setValueInObject(res, x.path, x.message)
      return res
    }, [])
  }
}

export function validateForm<T>(schema: AnySchema, data: FormValues<T>) {
  try {
    schema.validateSync(data, { abortEarly: false })
    return {}
  } catch (err) {
    return err.inner.reduce((res, x) => {
      setValueInObject(res, x.path, x.message)
      return res
    }, {})
  }
}

export function readForm<T>(schema: AnySchema, data: FormValues<any>): T {
  return schema.cast(data)
}

export function useFormSubmit(handler: () => void) {
  const onSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    e => {
      e.preventDefault()
      handler()
    },
    [handler],
  )

  return [onSubmit]
}

function setValueInObject<T>(obj: Record<string, any>, path: string | string[], value: T) {
  if (typeof path === 'string') {
    path = path.split('.')
  }

  if (path.length === 0) {
    return
  }

  const current = path.shift()!
  const arrayMatch = current.match(/(^.+)\[([0-9]+)\]/)

  if (arrayMatch && arrayMatch.length > 2) {
    const fieldIndex = parseInt(arrayMatch.pop()!, 10)
    const field = arrayMatch.pop()!

    obj[field] = obj[field] ?? []
    const target = obj[field]

    if (path.length === 0) {
      target[fieldIndex] = value
    } else {
      target[fieldIndex] = target[fieldIndex] || {}
      setValueInObject(target[fieldIndex], path, value)
    }
  } else {
    if (path.length === 0) {
      obj[current] = value
    } else {
      obj[current] = obj[current] || {}
      setValueInObject(obj[current], path, value)
    }
  }
}
