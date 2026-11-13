import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[15px] font-medium tracking-[0.01em] cursor-pointer transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-saffron text-wine hover:shadow-[var(--saffron-glow)]",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "glass-btn text-ivory hover:border-saffron/70",
        secondary: "glass-btn text-ivory hover:border-saffron/70",
        ghost: "hover:bg-ivory/10 hover:translate-y-0",
        link: "text-saffron underline-offset-4 hover:underline",
        lightOutline: "glass-btn text-ivory hover:border-saffron/70",
        cream: "bg-saffron text-wine hover:shadow-[var(--saffron-glow)]",
        creamOutline: "glass-btn text-ivory hover:border-saffron/70",
        burgundy: "bg-saffron text-wine hover:shadow-[var(--saffron-glow)]",
        editorial: "glass-btn text-ivory hover:border-saffron/70",
        text: "px-0 text-ivory underline decoration-saffron underline-offset-4 hover:text-saffron hover:translate-y-0",
      },
      size: {
        default: "min-h-12 px-6 py-3",
        sm: "min-h-10 px-4 text-xs",
        lg: "min-h-14 px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
