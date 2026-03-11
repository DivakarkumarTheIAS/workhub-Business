import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export const uploadFile = async (path: string, file: File): Promise<string> => {
    // 15 second timeout for the entire operation
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Upload timed out after 15 seconds")), 15000)
    );

    try {
        if (!storage) throw new Error("Storage not initialized - check firebase.ts");
        if (!file) throw new Error("No file provided for upload");

        console.log(`[Storage] Starting: ${path}`, { name: file.name, size: file.size });

        const storageRef = ref(storage, path);

        const uploadProcess = (async () => {
            const result = await uploadBytes(storageRef, file);
            console.log("[Storage] Bytes uploaded successfully");
            const url = await getDownloadURL(storageRef);
            console.log("[Storage] Download URL retrieved");
            return url;
        })();

        const downloadUrl = await Promise.race([uploadProcess, timeout]);
        return downloadUrl;
    } catch (error: any) {
        console.error("[Storage] Utility Error:", error);

        if (error.code === 'storage/unauthorized') {
            throw new Error("Permission Denied: Ensure Storage rules allow uploads.");
        } else if (error.code === 'storage/quota-exceeded') {
            throw new Error("Storage quota exceeded.");
        } else if (error.code === 'storage/retry-limit-exceeded') {
            throw new Error("Network timeout: Too many retries.");
        }

        throw error;
    }
};
