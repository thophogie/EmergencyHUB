import { useState } from "react";
import { Home, Mail, User, PhoneCall, Send, Loader2 } from "lucide-react";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { HotlineDrawerContent } from "@/components/HotlineDrawerContent";
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
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <Drawer>
        {/* Emergency Button - Floating above */}
        <div className="absolute -top-12 left-0 right-0 flex justify-center px-15">
          <DrawerTrigger asChild>
            <button className="bg-brand-red hover:bg-brand-red-hover text-white w-full max-w-md py-1 rounded-full shadow-lg flex items-center justify-center gap-2 border-2 border-white active:scale-95 transition-transform animate-pulse cursor-pointer">
              <PhoneCall size={24} fill="white" />
              <span className="font-bold text-lg uppercase tracking-wide">
                Emergency Hotlines!
              </span>
            </button>
          </DrawerTrigger>
        </div>

        {/* Navigation Bar */}
        <div className="bg-brand-yellow h-17 flex items-end justify-around pb-4 pt-8 px-6 rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.2)]">
          <button 
            className="flex flex-col items-center gap-1 text-brand-blue hover:text-white transition-colors"
            data-testid="button-home"
          >
            <div className="bg-white p-2 rounded-full shadow-sm">
              <Home size={24} className="text-brand-blue" />
            </div>
          </button>

          <button 
            className="flex flex-col items-center gap-1 text-brand-blue hover:text-white transition-colors"
            onClick={() => setSmsDialogOpen(true)}
            data-testid="button-sms"
          >
            <div className="bg-brand-blue p-2 rounded-full shadow-sm">
              <Mail size={24} className="text-white" />
            </div>
          </button>

          <button 
            className="flex flex-col items-center gap-1 text-brand-blue hover:text-white transition-colors"
            data-testid="button-profile"
          >
            <div className="bg-white p-2 rounded-full shadow-sm">
              <User size={24} className="text-brand-blue" />
            </div>
          </button>
        </div>

        <HotlineDrawerContent />
      </Drawer>

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
