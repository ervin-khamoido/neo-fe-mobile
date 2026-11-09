import { readable } from '@ts-awesome/model-reader'

export class HelpCenterArticle {
  @readable(String) id!: string
  @readable(String) title!: string
  @readable(String) description!: string
  @readable(Number) thumbsUp!: number
  @readable(Number) thumbsDown!: number
}

export class HelpCenterFolder {
  @readable(String) id!: string
  @readable(String) name!: string
  @readable([HelpCenterArticle]) articles!: HelpCenterArticle[]
}

export class HelpCenterCategory {
  @readable(String) id!: string
  @readable(String) name!: string
  @readable([HelpCenterFolder]) folders!: HelpCenterFolder[]
}

export class HelpCenterSection {
  @readable(String) id!: string
  @readable(String) title!: string
  @readable([HelpCenterArticle]) data!: HelpCenterArticle[]
}
