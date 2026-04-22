import { Text, clx } from "@medusajs/ui"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import React from "react"

type AccordionItemProps = AccordionPrimitive.AccordionItemProps & {
  title: string
  subtitle?: string
  description?: string
  required?: boolean
  tooltip?: string
  forceMountContent?: true
  headingSize?: "small" | "medium" | "large"
  customTrigger?: React.ReactNode
  complete?: boolean
  active?: boolean
  triggerable?: boolean
  children: React.ReactNode
}

type AccordionProps =
  | (AccordionPrimitive.AccordionSingleProps &
      React.RefAttributes<HTMLDivElement>)
  | (AccordionPrimitive.AccordionMultipleProps &
      React.RefAttributes<HTMLDivElement>)

const Accordion: React.FC<AccordionProps> & {
  Item: React.FC<AccordionItemProps>
} = ({ children, ...props }) => {
  return (
    <AccordionPrimitive.Root {...props}>{children}</AccordionPrimitive.Root>
  )
}

const Item: React.FC<AccordionItemProps> = ({
  title,
  subtitle,
  description,
  children,
  className,
  headingSize = "large",
  customTrigger = undefined,
  forceMountContent = undefined,
  triggerable,
  ...props
}) => {
  return (
    <AccordionPrimitive.Item
      {...props}
      className={clx(
        "border-dark/[0.1] group border-t last:mb-0 last:border-b",
        "py-4",
        className
      )}
    >
      <AccordionPrimitive.Header className="px-1">
        <AccordionPrimitive.Trigger className="flex w-full items-center justify-between py-2 cursor-pointer group/trigger hover:text-primary transition-colors">
          <div className="flex items-center gap-4">
            <Text className="font-display font-semibold text-dark text-[17px]">
              {title}
            </Text>
            <Text
              as="span"
              className="hidden small:inline text-[11px] tracking-[0.16em] uppercase text-dark/40 font-sans font-semibold group-radix-state-open:hidden"
            >
              Tap to expand
            </Text>
          </div>
          {customTrigger || <MorphingTrigger />}
        </AccordionPrimitive.Trigger>
        {subtitle && (
          <Text as="span" size="small" className="mt-1">
            {subtitle}
          </Text>
        )}
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        forceMount={forceMountContent}
        className={clx(
          "radix-state-closed:animate-accordion-close radix-state-open:animate-accordion-open radix-state-closed:pointer-events-none px-1"
        )}
      >
        <div className="inter-base-regular group-radix-state-closed:animate-accordion-close">
          {description && <Text>{description}</Text>}
          <div className="w-full">{children}</div>
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}

Accordion.Item = Item

const MorphingTrigger = () => {
  return (
    <div
      className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all relative bg-primary/10 text-primary group-hover/trigger:bg-primary group-hover/trigger:text-white"
      aria-hidden="true"
    >
      <span
        className="absolute inset-y-[30%] left-1/2 -translate-x-1/2 w-[2px] rounded-full bg-current group-radix-state-open:rotate-90 duration-300"
      />
      <span
        className="absolute inset-x-[30%] top-1/2 -translate-y-1/2 h-[2px] rounded-full bg-current group-radix-state-open:rotate-90 group-radix-state-open:opacity-0 duration-300"
      />
    </div>
  )
}

export default Accordion
