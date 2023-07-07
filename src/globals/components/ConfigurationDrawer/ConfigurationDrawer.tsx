import Button from "@geist-ui/core/esm/button"
import ChevronUp from '@geist-ui/icons/chevronUp'
import Drawer from "@geist-ui/core/esm/drawer"
import { ipcRenderer } from "electron"
import { useEffect, useState } from "react"


type ConfigurationDrawerProps = {
  settings: any[]
}
const ConfigurationDrawer = ({ settings }: ConfigurationDrawerProps): JSX.Element => {
  const [state, setState] = useState(false)
  const open = () => { setState(true) }
  const close = () => { setState(false) }

  useEffect(() => {
    ipcRenderer.on("blur", (event: any) => {
      close()
    })
  }, [])

  return (
    <div className="drawer-component">
      <Button ghost auto scale={2 / 3} px={0.6}
        style={{ position: "fixed", bottom: 10, left: 10 }}
        onClick={() => open()}
        iconRight={<ChevronUp />}
      />
      <Drawer wrapClassName="drawer-wrapper" visible={state} onClose={() => setState(false)} placement='bottom'>
        <Drawer.Title>Window-specific settings</Drawer.Title>
        <Drawer.Subtitle>These options will be applied to the current window</Drawer.Subtitle>
        <Drawer.Content>
          <div className="settings">
            {settings.map((setting: any, index: number) =>
              <div className="setting" key={index}>{setting}</div>)}
          </div>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

export default ConfigurationDrawer;