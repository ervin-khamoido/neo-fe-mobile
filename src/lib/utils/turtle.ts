export class Turtle {
  private _raw: string[] = []

  moveTo(x: number, y: number): this {
    this._raw.push(`M${x},${y}`)
    return this
  }

  lineTo(x: number, y: number): this {
    this._raw.push(`L${x},${y}`)
    return this
  }

  arcTo(r: number, largeArc: boolean, sweepFlag: boolean, x: number, y: number): this {
    this._raw.push(`A${r},${r} 0 ${+largeArc} ${+sweepFlag} ${x} ${y}`)
    return this
  }

  polarMoveTo(r: number, cx: number, cy: number, deg: number): this {
    // 0deg has (1, 0)-vector, 90deg has (0, -1)-vector
    const x = cx + r * Math.cos((deg / 180) * Math.PI)
    const y = cy + r * Math.sin((deg / 180) * Math.PI)

    this._raw.push(`M${x},${y}`)

    return this
  }

  polarLineTo(r: number, cx: number, cy: number, deg: number): this {
    // 0deg has (1, 0)-vector, 90deg has (0, 1)-vector
    const x = cx + r * Math.cos((deg / 180) * Math.PI)
    const y = cy + r * Math.sin((deg / 180) * Math.PI)

    this._raw.push(`L${x},${y}`)

    return this
  }

  polarArcTo(r: number, cx: number, cy: number, deg: number, largeArc = true, sweep = true): this {
    const x = cx + r * Math.cos((deg / 180) * Math.PI)
    const y = cy + r * Math.sin((deg / 180) * Math.PI)

    this._raw.push(`A${r},${r} 0 ${+largeArc} ${+sweep} ${x} ${y}`)

    return this
  }

  close(): this {
    this._raw.push('z')
    return this
  }

  path(): string {
    return this._raw.join(' ')
  }
}
