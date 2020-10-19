package models

import "github.com/centrifugal/centrifuge"

// ChannelPublisher writes data into the main channel
type ChannelPublisher func(channel string, data []byte) error

// ChannelHandler defines the core channel behavior
type ChannelHandler interface {
	// This is called fast and often -- it must be synchrnozed
	GetChannelOptions(id string) centrifuge.ChannelOptions

	// Called when a client wants to subscribe to a channel
	OnSubscribe(c *centrifuge.Client, e centrifuge.SubscribeEvent) error

	// Called when something writes into the channel.  The returned value will be broadcast if len() > 0
	OnPublish(c *centrifuge.Client, e centrifuge.PublishEvent) ([]byte, error)

	// DoChannelHTTP is called from the HTTP API
	DoChannelHTTP(c *ReqContext, channel string)
}

// ChannelNamespaceHandler should be implemented by any core feature.
type ChannelNamespaceHandler interface {
	// This is called fast and often -- it must be synchrnozed
	GetHandlerForPath(path string) (ChannelHandler, error)

	// DoNamespaceHTTP is called from the HTTP API
	DoNamespaceHTTP(c *ReqContext)
}

// DashboardActivityChannel is a service to advertise dashboard activity
type DashboardActivityChannel interface {
	DashboardSaved(uid string, userID int64) error
	DashboardDeleted(uid string, userID int64) error
}
