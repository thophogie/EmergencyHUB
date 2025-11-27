import { useState } from "react";
import { Home, Mail, User, Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function BottomNav() {
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendSMS = async () => {
    if (!phoneNumber.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both a phone number and message.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send SMS");
      }

      toast({
        title: "SMS Sent!",
        description: "Your message has been sent successfully.",
      });
      
      setPhoneNumber("");
      setMessage("");
      setSmsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Failed to Send",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      {/* Navigation Bar */}
      <div className="bg-brand-yellow h-16 flex items-center justify-around px-6 rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.2)]">
        <button 
          className="flex flex-col items-center gap-1 text-brand-blue active:text-white transition-colors p-3 touch-manipulation min-w-[44px] min-h-[44px]"
          data-testid="button-home"
          style={{ touchAction: 'manipulation' }}
        >
          <div className="bg-white p-2.5 rounded-full shadow-sm">
            <Home size={22} className="text-brand-blue" />
          </div>
        </button>

        <button 
          className="flex flex-col items-center gap-1 text-brand-blue active:text-white transition-colors p-3 touch-manipulation min-w-[44px] min-h-[44px]"
          onClick={() => setSmsDialogOpen(true)}
          data-testid="button-sms"
          style={{ touchAction: 'manipulation' }}
        >
          <div className="bg-brand-blue p-2.5 rounded-full shadow-sm">
            <Mail size={22} className="text-white" />
          </div>
        </button>

        <button 
          className="flex flex-col items-center gap-1 text-brand-blue active:text-white transition-colors p-3 touch-manipulation min-w-[44px] min-h-[44px]"
          data-testid="button-profile"
          style={{ touchAction: 'manipulation' }}
        >
          <div className="bg-white p-2.5 rounded-full shadow-sm">
            <User size={22} className="text-brand-blue" />
          </div>
        </button>
      </div>

      {/* SMS Dialog */}
      <Dialog open={smsDialogOpen} onOpenChange={setSmsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send SMS Message
            </DialogTitle>
            <DialogDescription>
              Send an SMS message to notify someone about an emergency or your status.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                data-testid="input-phone-number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                data-testid="input-sms-message"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSmsDialogOpen(false)}
              disabled={isSending}
              data-testid="button-cancel-sms"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendSMS}
              disabled={isSending}
              data-testid="button-send-sms"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send SMS
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
