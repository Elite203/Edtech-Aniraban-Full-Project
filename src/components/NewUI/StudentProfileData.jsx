import { useState, useEffect } from 'react';

export const useStudentProfile = () => {
  const [user, setUser] = useState({ name: "", photo: "", id: "", number: "", first_name: "", last_name: "" });
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const studentId = userData.id || "";
      
      if (studentId) {
        fetch(`${BASE_URL}api/Students/get_student_profile.php?id=${studentId}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              const student = data.student;
              const fullName = student.name || `${student.first_name || ""} ${student.last_name || ""}`.trim() || "Guest";
              setUser({
                name: fullName,
                first_name: student.first_name || "",
                last_name: student.last_name || "",
                photo: `${BASE_URL}api/Students/get_student_photo.php?id=${student.id}`,
                id: student.id || "",
                number: student.number || ""
              });
            } else {
              const fullName = userData.name || `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "Guest";
              setUser({
                name: fullName,
                first_name: userData.first_name || "",
                last_name: userData.last_name || "",
                photo: userData.image || `${BASE_URL}api/Students/get_student_photo.php?id=${userData.id}`,
                id: userData.id || "",
                number: userData.number || ""
              });
            }
          })
          .catch(err => {
            console.error("Error fetching student profile:", err);
            const fullName = userData.name || `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "Guest";
            setUser({
              name: fullName,
              first_name: userData.first_name || "",
              last_name: userData.last_name || "",
              photo: userData.image || `${BASE_URL}api/Students/get_student_photo.php?id=${userData.id}`,
              id: userData.id || "",
              number: userData.number || ""
            });
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [BASE_URL]);

  return { user, setUser, loading };
};
