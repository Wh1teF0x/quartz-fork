import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const AliasesList: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const aliases = fileData.frontmatter?.aliases
  if (aliases && aliases.length > 0) {
    return (
      <ul class={classNames(displayClass, "aliases")}>
        Альтернативные имена:
        {aliases.map((alias) => {
          return (
            <li>
              <span>{alias}</span>
            </li>
          )
        })}
      </ul>
    )
  } else {
    return null
  }
}

AliasesList.css = `
.aliases {
  list-style: none;
  display: flex;
  padding-left: 0;
  gap: 0.4rem;
  margin: 1rem 0;
  flex-wrap: wrap;
  align-items: center;
}

.section-li > .section > .aliases {
  justify-content: flex-end;
}
  
.aliases > li {
  display: inline-block;
  white-space: nowrap;
  margin: 0;
  overflow-wrap: normal;
}

.aliases > li:not(:last-of-type):after{
  content: ","
}
`

export default (() => AliasesList) satisfies QuartzComponentConstructor
