import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Plus, Pencil } from "lucide-react";

export default function FinanceProto() {
  const [view, setView] = useState("home");
  const [monthOffset, setMonthOffset] = useState(0);

  // Simple in-memory auth mock (not secure, proto only)
  const [users, setUsers] = useState(() => {
  const saved = localStorage.getItem("ff_users");
  return saved ? JSON.parse(saved) : [
    { username: "Florent", password: "" },
    { username: "Eriko", password: "" }
  ];
});

  const [newUser, setNewUser] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editingPasswordFor, setEditingPasswordFor] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [expenses, setExpenses] = useState(() => {
  const saved = localStorage.getItem("ff_expenses");
  return saved ? JSON.parse(saved) : [
    { id: 1, date: "2026-02-01", user: "Florent", category: "Groceries", amount: 4280, description: "OK Store", receipt: null },
    { id: 2, date: "2026-02-02", user: "Eriko", category: "Kids", amount: 8000, description: "Piano", receipt: null }
  ];
});

  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() + monthOffset);
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const monthLabel = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

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
    "Groceries": "bg-green-100 text-green-700",
    "Eating Out": "bg-orange-100 text-orange-700",
    "Kids": "bg-pink-100 text-pink-700",
    "Utilities": "bg-blue-100 text-blue-700",
    "Transport": "bg-yellow-100 text-yellow-700",
    "Home": "bg-purple-100 text-purple-700",
    "Health": "bg-red-100 text-red-700",
    "Misc": "bg-gray-200 text-gray-700"
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
      receipt: receiptData
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
    setUsers(users.map((u) =>
      u.username === username ? { ...u, password: newPass } : u
    ));
    setEditingPasswordFor(null);
  };

  const editingExpense = expenses.find((e) => e.id === editingId);

  if (view === "admin") {

  return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Admin</h1>
            <Button variant="outline" onClick={() => setView("home")}>Back</Button>
          </div>

          <Card className="rounded-2xl shadow">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold">Users & Passwords</h2>

              {users.map((u, i) => (
                <div key={i} className="border-b pb-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{u.username}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPasswordFor(u.username)}
                    >
                      Change Password
                    </Button>
                  </div>

                  {editingPasswordFor === u.username && (
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="New password"
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleChangePassword(u.username, newPassword)}
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 space-y-2">
                <h3 className="font-medium">Create New User</h3>
                <Input
                  placeholder="Username"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button onClick={handleAddUser}>Create User</Button>
              </div>
            </CardContent>
          </Card>

          
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
            <Button variant="outline" onClick={() => setEditMode(!editMode)}>
              {editMode ? "Done" : "Edit"}
            </Button>
            <Button variant="outline" onClick={() => setView("admin")}>Admin</Button>
          </div>
        </div>

        <Card className="rounded-2xl shadow">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setMonthOffset(monthOffset - 1)}>
                <ArrowLeft />
              </Button>
              <p className="text-gray-500 text-sm">Total this month</p>
              <Button variant="ghost" onClick={() => setMonthOffset(monthOffset + 1)}>
                <ArrowRight />
              </Button>
            </div>
            <p className="text-3xl font-bold text-center">¥{totalMonth.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow">
          <CardContent className="p-6">
            <form key={editingId || "new"} onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  name="date"
                  defaultValue={editingExpense ? editingExpense.date : new Date().toISOString().split("T")[0]}
                  required
                />
                <Input
                  type="number"
                  name="amount"
                  placeholder="Amount (¥)"
                  defaultValue={editingExpense ? editingExpense.amount : ""}
                  required
                  autoFocus
                />
              </div>

              <Select name="user" defaultValue={editingExpense ? editingExpense.user : undefined} required>
                <SelectTrigger>
                  <SelectValue placeholder="Who" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.username} value={u.username}>{u.username}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select name="category" defaultValue={editingExpense ? editingExpense.category : undefined} required>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Groceries">Groceries</SelectItem>
                  <SelectItem value="Eating Out">Eating Out</SelectItem>
                  <SelectItem value="Kids">Kids</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Misc">Misc</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="text"
                name="description"
                placeholder="Description"
                defaultValue={editingExpense ? editingExpense.description : ""}
              />
              <Input type="file" accept="image/*" capture="environment" />

              <Button type="submit" className="w-full rounded-2xl">
                <Plus className="mr-2" /> {editingId ? "Update Expense" : "Add Expense"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow">
          <CardContent className="p-6 space-y-3">
            {monthlyExpenses.map((e) => (
              <div key={e.id} className="flex justify-between items-start border-b pb-2">
                <div className="flex-1">
                  <p className="font-medium">{e.date} · {e.user}</p>
                  <p className="text-sm flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[e.category] || "bg-gray-200 text-gray-700"}`}>
                      {e.category}
                    </span>
                    <span className="text-gray-500">{e.description}</span>
                  </p>
                  {e.receipt && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => window.open(e.receipt, "_blank")}
                    >
                      View Receipt
                    </Button>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="font-semibold">¥{e.amount.toLocaleString()}</p>

                  {editMode && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(e)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">Totals by Category</h2>
            {Object.entries(totalsByCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amt]) => (
              <div key={cat} className="flex justify-between items-center">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[cat] || "bg-gray-200 text-gray-700"}`}>
                  {cat}
                </span>
                <span>¥{amt.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">Totals by Person</h2>
            {Object.entries(totalsByUser).map(([user, amt]) => (
              <div key={user} className="flex justify-between">
                <span>{user}</span>
                <span>¥{amt.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
