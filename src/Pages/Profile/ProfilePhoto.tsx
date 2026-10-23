import axios from "axios";
import { useContext, useRef, useState, type ChangeEvent } from "react";
import { Camera, Expand, LoaderCircle, X } from "lucide-react";
import { Button, Modal } from "@heroui/react";
import toast from "react-hot-toast";
import { UserContext } from "../../Components/Context/UserContext";
import { GetMyProfile, UploadProfilePhoto } from "../../Services/Profile.services";

export default function ProfilePhoto() {
  const userContext = useContext(UserContext);
  const user = userContext?.UserDetails;
  const fileInput = useRef<HTMLInputElement>(null);
  const pending = useRef(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);

  async function changePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || pending.current) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    pending.current = true;
    setIsUploading(true);
    try {
      await UploadProfilePhoto(file);
      const { data } = await GetMyProfile();
      userContext?.setUserDetails(data.data.user);
      toast.success("Profile photo updated.");
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : null;
      toast.error(message || "Could not update your profile photo. Please try again.");
    } finally {
      pending.current = false;
      setIsUploading(false);
    }
  }

  return (
    <>
      <div className="relative size-24 shrink-0 sm:size-28" aria-busy={isUploading}>
        <img src={user?.photo} alt={user?.name || "Profile photo"} className="size-full rounded-full border-4 border-white bg-white object-cover shadow-sm" />
        <button type="button" aria-label="Expand profile photo" onClick={() => setShowPhoto(true)} className="absolute -bottom-1 left-0 flex size-9 items-center justify-center rounded-full border-2 border-white bg-white text-sky-500 shadow-sm transition hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-sky-500">
          <Expand size={17} aria-hidden="true" />
        </button>
        <button type="button" aria-label={isUploading ? "Uploading profile photo" : "Change profile photo"} disabled={isUploading} onClick={() => fileInput.current?.click()} className="absolute -bottom-1 right-0 flex size-10 items-center justify-center rounded-full border-2 border-white bg-sky-500 text-white shadow-sm transition hover:bg-sky-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-wait disabled:opacity-70">
          {isUploading ? <LoaderCircle size={19} className="animate-spin" aria-hidden="true" /> : <Camera size={19} aria-hidden="true" />}
        </button>
        <input ref={fileInput} type="file" accept="image/*" aria-label="Choose profile photo" className="hidden" disabled={isUploading} onChange={changePhoto} />
        <span role="status" className="sr-only">{isUploading ? "Uploading profile photo..." : ""}</span>
      </div>

      <Modal.Backdrop isOpen={showPhoto} onOpenChange={setShowPhoto} className="bg-slate-900/70">
        <Modal.Container placement="center" size="lg">
          <Modal.Dialog className="rounded-2xl bg-white p-4">
            <Modal.Header className="flex flex-row items-center justify-between gap-4 pb-3">
              <Modal.Heading>Profile photo</Modal.Heading>
              <Button isIconOnly variant="ghost" aria-label="Close photo preview" onPress={() => setShowPhoto(false)}><X size={20} /></Button>
            </Modal.Header>
            <Modal.Body>
              <img src={user?.photo} alt={user?.name || "Profile photo"} className="max-h-[70vh] w-full rounded-xl object-contain" />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
