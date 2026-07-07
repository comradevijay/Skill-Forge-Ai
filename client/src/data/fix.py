content = open('dsaSheet.js').read()

old = """      {
        id: 'ch6-t4',
        title: 'Hard Problems of LL',
        problems: [
          { id: 'p172', title: 'Reverse LL in group of given size K', difficulty: 'Hard', leetcode: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', practice: '' },
          { id: 'p173', title: 'Rotate a LL', difficulty: 'Medium', leetcode: 'https://leetcode.com/problems/rotate-list/', practice: '' },
          { id: 'p174', title: 'Flattening of LL', difficulty: 'Hard', leetcode: '', practice: '' },
          { id: 'p175', title: 'Clone a Linked List with random and next pointer', difficulty: 'Hard', leetcode: 'https://leetcode.com/problems/copy-list-with-random-pointer/', practice: '' },
        ],
      },"""

new = """      {
        id: 'ch6-t4',
        title: 'Hard Problems of LL',
        problems: [
          { id: 'p172', title: 'Reverse LL in group of given size K', difficulty: 'Hard', leetcode: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', practice: '' },
          { id: 'p173', title: 'Rotate a LL', difficulty: 'Medium', leetcode: 'https://leetcode.com/problems/rotate-list/', practice: '' },
          { id: 'p174', title: 'Flattening of LL', difficulty: 'Hard', leetcode: '', practice: '' },
          { id: 'p175', title: 'Clone a Linked List with random and next pointer', difficulty: 'Hard', leetcode: 'https://leetcode.com/problems/copy-list-with-random-pointer/', practice: '' },
          { id: 'p175b', title: 'Find pairs with given sum in Doubly Linked List', difficulty: 'Medium', leetcode: '', practice: 'https://www.geeksforgeeks.org/find-pairs-given-sum-doubly-linked-list/' },
          { id: 'p175c', title: 'Remove duplicates from a sorted Doubly Linked List', difficulty: 'Easy', leetcode: '', practice: 'https://www.geeksforgeeks.org/remove-duplicates-sorted-doubly-linked-list/' },
          { id: 'p175d', title: 'Merge K Sorted Lists', difficulty: 'Hard', leetcode: 'https://leetcode.com/problems/merge-k-sorted-lists/', practice: '' },
          { id: 'p175e', title: 'Multiply two Linked Lists', difficulty: 'Medium', leetcode: '', practice: 'https://www.geeksforgeeks.org/multiply-two-numbers-represented-linked-lists/' },
        ],
      },"""

# DP: remove 2 duplicate/sub-variant problems
old2 = """          { id: 'p448', title: 'Matrix Chain Multiplication | Bottom Up', difficulty: 'Hard', leetcode: '', practice: '' },
          { id: 'p449', title: 'Minimum Cost to Cut the Stick', difficulty: 'Hard', leetcode: 'https://leetcode.com/problems/minimum-cost-to-cut-a-stick/', practice: '' },"""
new2 = """          { id: 'p449', title: 'Minimum Cost to Cut the Stick', difficulty: 'Hard', leetcode: 'https://leetcode.com/problems/minimum-cost-to-cut-a-stick/', practice: '' },"""

old3 = """          { id: 'p454', title: 'Maximum Rectangle Area with all 1s', difficulty: 'Hard', leetcode: 'https://leetcode.com/problems/maximal-rectangle/', practice: '' },
        ],
      },
      {
        id: 'ch16-t8',"""
new3 = """        ],
      },
      {
        id: 'ch16-t8',"""

content = content.replace(old, new, 1)
content = content.replace(old2, new2, 1)
content = content.replace(old3, new3, 1)

open('dsaSheet.js', 'w').write(content)
print("Done")
