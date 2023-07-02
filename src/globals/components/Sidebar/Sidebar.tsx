export const Sidebar = (props: any) => {
    return (
        <div>
            {props.openSettings ?
                <button>Open settings</button>
                : <></>
            }
            {props.darkMode ?
                <button>Dark mode</button>
                : <></>
            }
        </div>
    )
}