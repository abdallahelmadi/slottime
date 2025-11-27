"use client"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Todo {
  id: string
  date: string
  startTime: string
  endTime: string
  name: string
}

export default function Home() {

  const [date, setDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingTodos, setFetchingTodos] = useState(true)

  // Fetch todos from API
  const fetchTodos = async () => {
    try {
      setFetchingTodos(true)
      const response = await fetch('/api/todos')
      if (response.ok) {
        const data = await response.json()
        setTodos(data)
      }
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setFetchingTodos(false)
    }
  }

  // Format date to Italy timezone
  const formatDateItaly = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      timeZone: 'Europe/Rome',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-') // Convert DD/MM/YYYY to YYYY-MM-DD
  }

  // Run cleanup to delete expired todos
  const runCleanup = async () => {
    try {
      await fetch('/api/cron/cleanup')
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  }

  // Fetch todos on component mount
  useEffect(() => {
    // Initial fetch and cleanup
    runCleanup().then(() => fetchTodos())
    
    // Set up interval to check and cleanup every minute
    const interval = setInterval(() => {
      runCleanup().then(() => fetchTodos())
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [])

  // Handle form submission
  const handleSubmit = async () => {
    if (!date || !startTime || !endTime || !name) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formatDateItaly(date), // Format in Italy timezone
          startTime,
          endTime,
          name,
        }),
      })

      if (response.ok) {
        // Clear form
        setStartTime("")
        setEndTime("")
        setName("")
        setDate(new Date())
        // Refresh todos list
        await fetchTodos()
      } else {
        const error = await response.json()
        alert(error || 'Error adding todo')
      }
    } catch (error) {
      console.error('Error submitting todo:', error)
      alert('Error adding todo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-2 w-full flex justify-center">
      <div className="w-full max-w-[1200px] mt-10 flex flex-col">


        <div className="flex gap-4 max-[555px]:flex-col w-full">

          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border shadow-sm"
            captionLayout="dropdown"
          />

          <div className="flex flex-col">
            <span> inizio </span>
            <Input 
              type="time" 
              className="w-60 mb-2"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <span> fine </span>
            <Input 
              type="time" 
              className="w-60 mb-2"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            <span> nome </span>
            <Input 
              type="text" 
              placeholder="..." 
              className="w-60"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-11 rounded-sm bg-black text-white cursor-pointer mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          {loading ? 'Aggiungendo...' : 'Aggiungere'}
        </button>


        <Table className="mt-10">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-orange-600">Data</TableHead>
              <TableHead className="text-orange-600">Inizio</TableHead>
              <TableHead className="text-orange-600">Fine</TableHead>
              <TableHead className="text-right text-orange-600">Nome</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetchingTodos ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  Caricamento...
                </TableCell>
              </TableRow>
            ) : todos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  Nessun appuntamento trovato
                </TableCell>
              </TableRow>
            ) : (
              todos.map((todo) => {
                // Format date for display
                const displayDate = new Date(todo.date).toLocaleDateString('it-IT', {
                  timeZone: 'Europe/Rome',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
                return (
                  <TableRow key={todo.id}>
                    <TableCell className="font-medium">{displayDate}</TableCell>
                    <TableCell>{todo.startTime}</TableCell>
                    <TableCell>{todo.endTime}</TableCell>
                    <TableCell className="text-right">{todo.name}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>




      </div>
    </div>
  );
}