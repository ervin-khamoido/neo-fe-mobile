import { Container } from 'inversify'

export const InitialPropsSymbol = Symbol.for('initialProps')
export const NavigationParamsSymbol = Symbol.for('navigationParams')

export function configureComponentScope<T extends Record<string, any>>(root: Container, props: T) {
  const { route: { params = {} } = {}, ...otherProps } = props

  const child = root.createChild()

  child.bind(InitialPropsSymbol).toConstantValue(otherProps)
  child.bind(NavigationParamsSymbol).toConstantValue(params)

  return child
}
