// A simpler performance timer that can check elapsed time

function PerformanceTimer() {

    this.startTime = UaDateTime.utcNow();

    this.start = function()
    {
        this.startTime = UaDateTime.utcNow();
    }

    this.Start = function()
    {
        this.start();
    }

    this.TakeReading = function() {
        return this.startTime.msecsTo( UaDateTime.utcNow() );
    }

    this.TakeReadingSeconds = function() {
        return this.startTime.secsTo( UaDateTime.utcNow() );
    }
};