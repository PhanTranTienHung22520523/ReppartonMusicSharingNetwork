import { useState, useEffect } from 'react';
import { getUserById } from '../api/userService';

export default function ArtistName({ userId, initialName, className }) {
    const [name, setName] = useState(initialName || "...");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If we have an initial name and it doesn't look like an ID, use it
        if (initialName && isNaN(initialName) && initialName.length > 5 && !/^[0-9a-fA-F]{24}$/.test(initialName)) {
            setName(initialName);
            return;
        }

        if (userId && (typeof userId === 'string' || typeof userId === 'number')) {
            const idStr = String(userId);
            // Basic check to see if it's an ID (usually 24 chars for mongo or numeric)
            if (idStr.length > 5 || !isNaN(idStr)) {
                setLoading(true);
                getUserById(idStr)
                    .then(res => {
                        const userData = res?.data || res?.user || res;
                        const newName = userData?.username || userData?.fullName || userData?.name;
                        if (newName) setName(newName);
                        else setName("Unknown Artist");
                    })
                    .catch(() => {
                        setName("Unknown Artist");
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            }
        }
    }, [userId, initialName]);

    return <span className={className}>{name}</span>;
}
