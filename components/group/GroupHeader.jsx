"use client"

import React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Settings, Pencil } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

const GroupHeader = ({ group, onEdit, onSettings }) => {
  const {
    name,
    description,
    createdAt,
    type,
    members = [],
  } = group

  return (
    <div className="w-full rounded-2xl border backdrop-blur-md shadow-md px-6 py-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      
      {/* Left Side: Info */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {name}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
          <Badge variant="outline" className="rounded-full text-xs">
            {type || "General"}
          </Badge>
          <span className="text-xs">
            Created on {format(new Date(createdAt), "dd MMM yyyy")}
          </span>
        </div>
      </div>

      {/* Right Side: Members and Actions */}
      <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
        
        {/* Avatars */}
        <div className="flex items-center -space-x-3">
          {members.slice(0, 5).map((m, i) => (
            <Avatar key={i} className="h-8 w-8 ring-2 ring-background">
              <AvatarFallback className="text-xs font-medium">
                {m.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {members.length > 5 && (
            <span className="ml-4 text-xs text-muted-foreground">
              +{members.length - 5} more
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" onClick={onSettings}>
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  )
}

export default GroupHeader
