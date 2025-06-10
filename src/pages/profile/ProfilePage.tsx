import { useUser } from "../../hooks/user"
import { TopNavigation } from "../TopNavigation"
import { InfoSection } from "./InfoSection"
import { AvatarSection } from "./AvatarSection"
import { PasswordSection } from "./PasswordSection"

const MainSection = () => {
  const user = useUser()!

  return (
    <div className="flex flex-col items-center bg-regular-bgcl text-regular-text-cl">
      <div className="border border-divider-cl w-[625px] mt-5 mb-10 rounded-md">
        <AvatarSection originalAvatar={user.avatar} fullName={user.fullName} />
        <hr />
        <InfoSection userData={user} />
        <hr />
        <PasswordSection />
      </div>
    </div>
  )
}

const ProfilePage = () => {
  return (
    <div>
      <TopNavigation />
      <MainSection />
    </div>
  )
}

export default ProfilePage
