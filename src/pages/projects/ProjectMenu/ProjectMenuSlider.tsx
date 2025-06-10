type TProjectMenuSliderProps = {
  children: React.JSX.Element
  active: boolean
}

export const ProjectMenuSlider = ({ children, active }: TProjectMenuSliderProps) => {
  return (
    <section
      className={`${active ? "left-0" : "left-[105%]"} transition-[left] absolute z-20 top-0 px-4 py-2 pb-4 h-[inherit] w-full bg-modal-board-bgcl`}
    >
      {children}
    </section>
  )
}
