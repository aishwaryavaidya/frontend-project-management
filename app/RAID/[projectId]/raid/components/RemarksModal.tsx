// app/RAID/[projectId]/raid/components/RemarksModal.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { PlusIcon, TrashIcon } from 'lucide-react'
import type { Remark } from '@/types/raid'
import { cn } from '@/lib/utils'

export function RemarksModal({
  remarks,
  onSave
}: {
  remarks: Remark[]
  onSave: (newRemarks: Remark[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [localRemarks, setLocalRemarks] = useState([...remarks])
  const [newRemark, setNewRemark] = useState('')
  const [author, setAuthor] = useState('')

  const addRemark = () => {
    if (newRemark && author) {
      setLocalRemarks([...localRemarks, {
        text: newRemark,
        author: author,
        date: new Date()
      }])
      setNewRemark('')
      setAuthor('')
    }
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setOpen(true)}
        className="hover:bg-primary/10 transition-colors"
      >
        View Remarks
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl animate-slide-in sm:max-w-[600px] p-0 gap-0 overflow-hidden">
          <div className="backdrop-blur-sm bg-background/95 p-6 shadow-lg">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-xl font-semibold">Remarks History</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                {localRemarks.map((remark, index) => (
                  <div 
                    key={index} 
                    className="border p-4 rounded-lg bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">{remark.author}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(remark.date).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocalRemarks(localRemarks.filter((_, i) => i !== index))}
                        className="opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-2 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-foreground/90">{remark.text}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Input
                  placeholder="Your name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="transition-all border-muted focus:ring-2 focus:ring-primary/20 bg-transparent"
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="New remark"
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    className="transition-all border-muted focus:ring-2 focus:ring-primary/20 bg-transparent"
                  />
                  <Button 
                    onClick={addRemark}
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all shadow-sm hover:shadow-lg"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  className="hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    onSave(localRemarks)
                    setOpen(false)
                  }}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all shadow-sm hover:shadow-lg"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}