<?php

namespace App\EventSubscriber;

use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;

class LastActivitySubscriber implements EventSubscriberInterface
{
    private TokenStorageInterface $tokenStorage;
    private EntityManagerInterface $em;

    public function __construct(TokenStorageInterface $tokenStorage, EntityManagerInterface $em)
    {
        $this->tokenStorage = $tokenStorage;
        $this->em = $em;
    }

    public function onKernelRequest(RequestEvent $event)
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $token = $this->tokenStorage->getToken();
        if (!$token) {
            return;
        }

        $user = $token->getUser();
        if (!$user instanceof User) {
            return;
        }

        try {
            $now = new \DateTimeImmutable();
            $last = $user->getLastActivity();

            // éviter flush à chaque requête : mettre à jour uniquement si > 60s
            if (!$last || $now->getTimestamp() - $last->getTimestamp() > 60) {
                $user->setLastActivity($now);
                $this->em->persist($user);
                $this->em->flush();
            }
        } catch (\Exception $e) {
            // silent fail
            error_log('LastActivitySubscriber error: ' . $e->getMessage());
        }
    }

    public static function getSubscribedEvents()
    {
        return [
            'kernel.request' => ['onKernelRequest', 0],
        ];
    }
}
