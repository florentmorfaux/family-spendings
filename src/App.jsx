import React from "react";
import { useState, useMemo, useEffect } from "react";
import { Plus, Pencil, ArrowLeft, ArrowRight } from "lucide-react";
import './index.css';

export default function App() {
  const [view, setView] = useState("home");
  const [monthOffset, setMonthOffset] = useState(0);

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("ff_users");
    return saved
      ? JSON.parse(saved)
      : [
          { username: "Florent", password: "" },
          { username: "Eriko", password: "" },
        ];
  });
  const [newUser, setNewUser] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editingPasswordFor, setEditingPasswordFor] = useState(null);

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("ff_expenses");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            date: "2026-02-01",
            user: "Florent",
            category: "Groceries",
            amount: 4280,
            description: "OK Store",
            receipt: null,
          },
          {
            id: 2,
            date: "2026-02-02",
            user: "Eriko",
            category: "Kids",
            amount: 8000,
            description: "Piano",
            receipt: null,
          },
        ];
  });

  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() + monthOffset);
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const monthLabel = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const monthlyExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }, [expenses, month, year]);

  const totalMonth = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const totalsByCategory = useMemo(() => {
    const map = {};
    monthlyExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [monthlyExpenses]);

  const totalsByUser = useMemo(() => {
    const map = {};
    monthlyExpenses.forEach((e) => {
      map[e.user] = (map[e.user] || 0) + e.amount;
    });
    return map;
  }, [monthlyExpenses]);

  const CATEGORY_COLORS = {
    Groceries: "bg-green-100 text-green-700",
    "Eating Out": "bg-orange-100 text-orange-700",
    Kids: "bg-pink-100 text-pink-700",
    Utilities: "bg-blue-100 text-blue-700",
    Transport: "bg-yellow-100 text-yellow-700",
    Home: "bg-purple-100 text-purple-700",
    Health: "bg-red-100 text-red-700",
    Misc: "bg-gray-200 text-gray-700",
  };

  useEffect(() => {
    localStorage.setItem("ff_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("ff_users", JSON.stringify(users));
  }, [users]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const form = e.target;

    let receiptData = null;
    const fileInput = form.querySelector('input[type="file"]');
    if (fileInput?.files?.[0]) {
      const file = fileInput.files[0];
      receiptData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    const expenseData = {
      id: editingId || Date.now(),
      date: form.date.value,
      user: form.user.value,
      category: form.category.value,
      amount: Number(form.amount.value),
      description: form.description.value,
      receipt: receiptData,
    };

    if (editingId) {
      setExpenses(expenses.map((ex) => (ex.id === editingId ? expenseData : ex)));
      setEditingId(null);
    } else {
      setExpenses([expenseData, ...expenses]);
    }

    form.reset();
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddUser = () => {
    if (newUser && !users.find((u) => u.username === newUser)) {
      setUsers([...users, { username: newUser, password: newPassword }]);
      setNewUser("");
      setNewPassword("");
    }
  };

  const handleChangePassword = (username, newPass) => {
    setUsers(users.map((u) => (u.username === username ? { ...u, password: newPass } : u)));
    setEditingPasswordFor(null);
  };

  const editingExpense = expenses.find((e) => e.id === editingId);

  if (view === "admin") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Admin</h1>
            <button
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              onClick={() => setView("home")}
            >
              Back
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="font-semibold">Users & Passwords</h2>

            {users.map((u) => (
              <div key={u.username} className="border-b pb-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{u.username}</span>
                  <button
                    className="px-2 py-1 border rounded-lg text-sm hover:bg-gray-100"
                    onClick={() => setEditingPasswordFor(u.username)}
                  >
                    Change Password
                  </button>
                </div>

                {editingPasswordFor === u.username && (
                  <div className="flex gap-2 mt-1">
                    <input
                      type="password"
                      placeholder="New password"
                      className="border rounded px-2 py-1"
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      className="px-2 py-1 border rounded hover:bg-gray-100"
                      onClick={() => handleChangePassword(u.username, newPassword)}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            ))}

            <div className="pt-4 space-y-2">
              <h3 className="font-medium">Create New User</h3>
              <input
                placeholder="Username"
                value={newUser}
                className="border rounded px-2 py-1 w-full"
                onChange={(e) => setNewUser(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={newPassword}
                className="border rounded px-2 py-1 w-full"
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleAddUser}
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-semibold">{monthLabel}</h1>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded-lg hover:bg-gray-100"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Done" : "Edit"}
            </button>
            <button
              className="px-3 py-1 border rounded-lg hover:bg-gray-100"
              onClick={() => setView("admin")}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Total Month */}
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <div className="flex justify-between items-center mb-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setMonthOffset(monthOffset - 1)}
            >
              <ArrowLeft />
            </button>
            <p className="text-gray-500 text-sm">Total this month</p>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setMonthOffset(monthOffset + 1)}
            >
              <ArrowRight />
            </button>
          </div>
          <p className="text-3xl font-bold">¥{totalMonth.toLocaleString()}</p>
        </div>

        {/* Add/Edit Expense */}
        <div className="bg-white rounded-2xl shadow p-6">
          <form key={editingId || "new"} onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                name="date"
                defaultValue={
                  editingExpense
                    ? editingExpense.date
                    : new Date().toISOString().split("T")[0]
                }
                className="border rounded px-2 py-1"
                required
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount (¥)"
                defaultValue={editingExpense ? editingExpense.amount : ""}
                className="border rounded px-2 py-1"
                required
                autoFocus
              />
            </div>

            <select
              name="user"
              defaultValue={editingExpense ? editingExpense.user : undefined}
              className="border rounded px-2 py-1 w-full"
              required
            >
              {users.map((u) => (
                <option key={u.username} value={u.username}>
                  {u.username}
                </option>
              ))}
            </select>

            <select
              name="category"
              defaultValue={editingExpense ? editingExpense.category : undefined}
              className="border rounded px-2 py-1 w-full"
              required
            >
              {Object.keys(CATEGORY_COLORS).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="description"
              placeholder="Description"
              defaultValue={editingExpense ? editingExpense.description : ""}
              className="border rounded px-2 py-1 w-full"
            />
            <input type="file" accept="image/*" capture="environment" className="w-full" />

            <button
              type="submit"
              className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Plus /> {editingId ? "Update Expense" : "Add Expense"}
            </button>
          </form>
        </div>

        {/* Expenses List */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-3">
          {monthlyExpenses.map((e) => (
            <div key={e.id} className="flex justify-between items-start border-b pb-2">
              <div className="flex-1">
                <p className="font-medium">
                  {e.date} · {e.user}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      CATEGORY_COLORS[e.category] || "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {e.category}
                  </span>
                  <span className="text-gray-500">{e.description}</span>
                </p>
                {e.receipt && (
                  <button
                    className="mt-2 px-2 py-1 border rounded text-sm hover:bg-gray-100"
                    onClick={() => window.open(e.receipt, "_blank")}
                  >
                    View Receipt
                  </button>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <p className="font-semibold">¥{e.amount.toLocaleString()}</p>

                {editMode && (
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => handleEdit(e)}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Totals by Category */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-2">
          <h2 className="font-semibold">Totals by Category</h2>
          {Object.entries(totalsByCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, amt]) => (
              <div key={cat} className="flex justify-between items-center">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    CATEGORY_COLORS[cat] || "bg-gray-200 text-gray-700"
                  }`}
                >
                  {cat}
                </span>
                <span>¥{amt.toLocaleString()}</span>
              </div>
            ))}
        </div>

        {/* Totals by User */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-2">
          <h2 className="font-semibold">Totals by Person</h2>
          {Object.entries(totalsByUser).map(([user, amt]) => (
            <div key={user} className="flex justify-between">
              <span>{user}</span>
              <span>¥{amt.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
