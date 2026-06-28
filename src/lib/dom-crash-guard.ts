/**
 * Defensive patch for a well-known class of React crash:
 *
 *   Failed to execute 'removeChild' on 'Node': The node to be removed is
 *   not a child of this node.
 *
 * This happens when something *outside* React's control (a browser
 * extension like Grammarly/ad-blockers/translate, or — on some mobile
 * browsers — aggressive tracker/ad filtering) detaches a DOM node that
 * React still believes is mounted. When React's commit phase then tries
 * to remove or reorder that same node, the browser throws because the
 * node's parent no longer matches what React expected.
 *
 * React itself doesn't guard against this (it assumes it has exclusive
 * control of the DOM subtree it owns), so the fix is applied at the
 * lowest possible level: make `removeChild` / `insertBefore` no-ops
 * (instead of throwing) when the node has already been detached by
 * something else. This is a widely used, low-risk workaround — it only
 * changes behavior in the exact situation where the browser would have
 * thrown anyway, so there's nothing to "break" by being defensive here.
 *
 * Client-only: the `Node` global doesn't exist during SSR.
 */
export function installDomCrashGuard() {
  if (typeof window === "undefined" || typeof Node === "undefined") return;

  const proto = Node.prototype as Node & {
    __domCrashGuardInstalled?: boolean;
  };
  if (proto.__domCrashGuardInstalled) return;
  proto.__domCrashGuardInstalled = true;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function removeChild<T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[dom-crash-guard] Skipped removeChild: node was already detached (likely by a browser extension).",
        );
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function insertBefore<T extends Node>(
    this: Node,
    newNode: T,
    referenceNode: Node | null,
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[dom-crash-guard] Skipped insertBefore: reference node was already detached (likely by a browser extension).",
        );
      }
      this.appendChild(newNode);
      return newNode;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}
