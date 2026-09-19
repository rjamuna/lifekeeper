import { useState, useEffect, useCallback } from "react";
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
  cancelReminder,
} from "../services/api";

export const useReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReminders();
      setReminders(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const addReminder = async (body) => {
    const res = await createReminder(body);
    setReminders((prev) => [...prev, res.data]);
    return res.data;
  };

  const editReminder = async (id, body) => {
    const res = await updateReminder(id, body);
    setReminders((prev) => prev.map((r) => (r._id === id ? res.data : r)));
    return res.data;
  };

  const removeReminder = async (id) => {
    await deleteReminder(id);
    setReminders((prev) => prev.filter((r) => r._id !== id));
  };

  const markComplete = async (id) => {
    const res = await completeReminder(id);
    setReminders((prev) => prev.map((r) => (r._id === id ? res.data : r)));
  };

  const markCancelled = async (id) => {
    const res = await cancelReminder(id);
    setReminders((prev) => prev.map((r) => (r._id === id ? res.data : r)));
  };

  return {
    reminders,
    loading,
    error,
    fetchReminders,
    addReminder,
    editReminder,
    removeReminder,
    markComplete,
    markCancelled,
  };
};
